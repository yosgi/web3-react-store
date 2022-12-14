import { useAuthState } from "@saleor/sdk";
import React, { useState } from "react";
import { useIntl } from "react-intl";

import { SavedAddressSelectionList } from "@/components";
import { notNullable } from "@/lib/util";
import { CheckoutDetailsFragment, useCheckoutBillingAddressUpdateMutation } from "@/saleor/api";

import { Button } from "../Button";
import { useRegions } from "../RegionsProvider";
import { messages } from "../translations";
import { AddressDisplay } from "./AddressDisplay";
import { AddressForm, AddressFormData } from "./AddressForm";

export interface BillingAddressSection {
  active: boolean;
  checkout: CheckoutDetailsFragment;
}

export function BillingAddressSection({ active, checkout }: BillingAddressSection) {
  const t = useIntl();
  const { authenticated } = useAuthState();
  const [editing, setEditing] = useState(!checkout.billingAddress);
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
    setEditing(false);
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
              toggleEdit={() => setEditing(false)}
              updateAddressMutation={updateMutation}
            />
      </div>
    </>
  );
}

export default BillingAddressSection;
