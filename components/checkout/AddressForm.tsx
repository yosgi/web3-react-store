
import { ethers } from "ethers";
import { useRouter } from "next/router";
import React from "react";
import { useForm } from "react-hook-form";
import { useIntl } from "react-intl";

import { usePaths } from "@/lib/paths";
import { useCheckout } from "@/lib/providers/CheckoutProvider";
import { AddressDetailsFragment, CheckoutError, CountryCode } from "@/saleor/api";
import {
  CheckoutDetailsFragment,
  useCheckoutCompleteMutation,
  useCheckoutPaymentCreateMutation,
  useCheckoutShippingMethodUpdateMutation,
  useCheckoutBillingAddressUpdateMutation
} from "@/saleor/api";

import { messages } from "../translations";
export interface AddressFormData {
  firstName: string;
  lastName: string;
  phone: string;
  country: CountryCode;
  streetAddress1: string;
  city: string;
  postalCode: string;
}

export interface AddressFormProps {
  existingAddressData?: AddressDetailsFragment;
  updateAddressMutation: (address: AddressFormData) => Promise<CheckoutError[]>;
  checkout: CheckoutDetailsFragment;
}

export function AddressForm({
  existingAddressData,
  updateAddressMutation,
  checkout
}: AddressFormProps) {
  const t = useIntl();
  const paths = usePaths();
  const router = useRouter();
  const {
    register: registerAddress,
    handleSubmit: handleSubmitAddress,
    formState: { errors: errorsAddress },
    setError: setErrorAddress,
  } = useForm<AddressFormData>({
    defaultValues: {
      firstName: existingAddressData?.firstName || "",
      lastName: existingAddressData?.lastName || "",
      phone: existingAddressData?.phone || "",
      country: "PL",
      streetAddress1: existingAddressData?.streetAddress1 || "",
      city: existingAddressData?.city || "",
      postalCode: existingAddressData?.postalCode || "",
    },
  });
  const { resetCheckoutToken } = useCheckout();
  const [checkoutPaymentCreateMutation] = useCheckoutPaymentCreateMutation();
  const [checkoutCompleteMutation] = useCheckoutCompleteMutation();
  const [checkoutShippingMethodUpdate] = useCheckoutShippingMethodUpdateMutation({});
  const [checkoutBillingAddressUpdate] = useCheckoutBillingAddressUpdateMutation({});
  const redirectToOrderDetailsPage = async () => {
    resetCheckoutToken();
    // without the `await` checkout data will be removed before the redirection which will cause issue with rendering checkout view
    await router.push(paths.order.$url());
  };
  const onAddressFormSubmit = handleSubmitAddress(async (formData: AddressFormData) => {
    const errors = await updateAddressMutation(formData);
    await checkoutBillingAddressUpdate({
      variables: {
        address: {
          ...formData,
        },
        token: checkout.token,
        locale: "EN",
      },
    });
    await checkoutShippingMethodUpdate({
      variables: {
        token: checkout.token,
        shippingMethodId: "U2hpcHBpbmdNZXRob2Q6Mg==",
        locale: "EN",
      },
    });

    // Assign errors to the form fields
    if (errors.length > 0) {
      errors.forEach((e) =>
        setErrorAddress(e.field as keyof AddressFormData, {
          message: e.message || "",
        })
      );
    }

    const { errors: paymentCreateErrors } = await checkoutPaymentCreateMutation({
      variables: {
        checkoutToken: checkout.token,
        paymentInput: {
          gateway: "saleor.payments.stripe",
          amount: checkout.totalPrice?.gross.amount,
        },
      },
    });
    await checkoutPaymentCreateMutation({
      variables: {
        checkoutToken: checkout.token,
        paymentInput: {
          gateway: "Token",
          amount: checkout.totalPrice?.gross.amount
        },
      },
    });


    if (paymentCreateErrors) {
      console.error(paymentCreateErrors);
      return;
    }
    const provider = new ethers.providers.Web3Provider(window.ethereum, {
      name: "MetaMask",
      chainId: 513100,
    });
    const signer = provider.getSigner();
    const recipient = "0x79Cf4A56E0eC0d0AeEC1307E84a2A116e7500C22";
    // eslint-disable-next-line no-unsafe-optional-chaining
    const amount = ethers.utils.parseEther(`${checkout.totalPrice?.gross.amount / 100  }`);

    // Use the sendTransaction method to create and send the transaction
    await signer.sendTransaction({
      to: recipient,
      value: amount
    });
    const { data: completeData, errors: completeErrors } = await checkoutCompleteMutation({
      variables: {
        checkoutToken: checkout.token,
      },
    });
    if (completeErrors) {
      console.error("complete errors:", completeErrors);
      return;
    }
    const order = completeData?.checkoutComplete?.order;
    if (order) {
      redirectToOrderDetailsPage();
    } else {
      console.error("Order was not created");
    }
  });
  return (
    <form onSubmit={onAddressFormSubmit}>
      <div className="grid grid-cols-12 gap-4 w-full">
        <div className="col-span-full">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            {t.formatMessage(messages.phoneField)}
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="phone"
              className="w-full border-gray-300 rounded-md shadow-sm text-base"
              {...registerAddress("phone", {
                required: false,
                pattern: /^([-]?[\s]?[0-9])+$/i,
              })}
            />
          </div>
        </div>

        <div className="col-span-full sm:col-span-6">
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            {t.formatMessage(messages.firstNameField)}
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="province"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
              {...registerAddress("firstName", {
                required: true,
              })}
            />
            {!!errorsAddress.firstName && <p>{errorsAddress.firstName.message}</p>}
          </div>
        </div>

        <div className="col-span-full sm:col-span-6">
          <label htmlFor="province" className="block text-sm font-medium text-gray-700">
            {t.formatMessage(messages.lastNameField)}
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="lastName"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
              {...registerAddress("lastName", {
                required: true,
              })}
            />
            {!!errorsAddress.lastName && <p>{errorsAddress.lastName.message}</p>}
          </div>
        </div>

        <div className="col-span-full">
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            {t.formatMessage(messages.addressField)}
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="streetAddress1"
              className="w-full border-gray-300 rounded-md shadow-sm text-base"
              {...registerAddress("streetAddress1", {
                required: true,
              })}
            />
            {!!errorsAddress.streetAddress1 && <p>{errorsAddress.streetAddress1.message}</p>}
          </div>
        </div>

        <div className="col-span-full sm:col-span-6">
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            {t.formatMessage(messages.cityField)}
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="city"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
              {...registerAddress("city", { required: true })}
            />
            {!!errorsAddress.city && <p>{errorsAddress.city.message}</p>}
          </div>
        </div>

        {/* <div className="col-span-full sm:col-span-4">
        <label
          htmlFor="province"
          className="block text-sm font-medium text-gray-700"
        >
          Province
        </label>
        <div className="mt-1">
          <input
            type="text"
            id="province"
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div> */}

        <div className="col-span-full sm:col-span-6">
          <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700">
            {t.formatMessage(messages.postalCodeField)}
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="postal-code"
              autoComplete="postal-code"
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-base"
              {...registerAddress("postalCode", {
                required: true,
              })}
            />
            {!!errorsAddress.postalCode && <p>{errorsAddress.postalCode.message}</p>}
          </div>
        </div>

        <div className="col-span-full">
          <button type="button" className="btn-checkout-section" onClick={onAddressFormSubmit}>
            {t.formatMessage(messages.paymentCardHeader)}
          </button>
        </div>
      </div>
    </form>
  );
}
