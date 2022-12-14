import React from "react";
import { useIntl } from "react-intl";

import { notNullable } from "@/lib/util";
import { CheckoutDetailsFragment, useCheckoutBillingAddressUpdateMutation } from "@/saleor/api";

import { useRegions } from "../RegionsProvider";
import { messages } from "../translations";
import { AddressForm, AddressFormData } from "./AddressForm";

export interface BillingAddressSection {
  active: boolean;
  checkout: CheckoutDetailsFragment;
}

export function BillingAddressSection({ active, checkout }: BillingAddressSection) {
  const t = useIntl();
  const [checkoutBillingAddressUpdate] = useCheckoutBillingAddressUpdateMutation({});
  
  const { query } = useRegions();

  const updateMutation = async (formData: AddressFormData) => {
    const { data } = await checkoutBillingAddressUpdate({
      variables: {
        address: {
          ...formData,
        },
        token: checkout.token,
        locale: query.locale,
      },
    });
    return data?.checkoutBillingAddressUpdate?.errors.filter(notNullable) || [];
  };

  return (
    <>
      <div className="mt-4 mb-4">
        <h2
          className={active ? "checkout-section-header-active" : "checkout-section-header-disabled"}
        >
          {t.formatMessage(messages.shippingAddressCardHeader)}
        </h2>
      </div>
      <div>
      <AddressForm
              existingAddressData={checkout.billingAddress || undefined}
              updateAddressMutation={updateMutation}
            />
      </div>
    </>
  );
}

export default BillingAddressSection;
