import DeleteAccountForm from "./DeleteAccountForm";
import DeleteAccountInfo from "./DeleteAccountInfo";
import WarningAlert from "./WarningAlert";

export default function UserDeletePage() {
  return (
    <div className="flex w-full flex-col items-center sm:px-0">
      <WarningAlert />
      <div className="bg-bg-surface-elevated mt-4 rounded p-6 shadow">
        <DeleteAccountInfo />
        <DeleteAccountForm />
      </div>
    </div>
  );
}
