import { AddressDetailsFragment } from "@/saleor/api";

export interface AddressDisplayProps {
  address: AddressDetailsFragment;
}

export function AddressDisplay({ address }: AddressDisplayProps) {
  return (
    <div className="text-base">
      <address className="not-italic mb-2">
        <p>
          {address?.firstName} {address?.lastName}
        </p>
        <p>{address?.streetAddress1}</p>
        <p>
          {address?.city}
        </p>
      </address>
      <div>{address?.phone}</div>
    </div>
  );
}

export default AddressDisplay;
