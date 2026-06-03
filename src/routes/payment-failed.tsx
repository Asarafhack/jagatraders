import { createFileRoute } from "@tanstack/react-router";

export const Route =
createFileRoute("/payment-failed")({
  component: FailedPage,
});

function FailedPage() {

  return (
    <div className="min-h-screen flex items-center justify-center">

      <div className="text-center">

        <h1 className="text-5xl font-bold text-red-500">
          Payment Failed
        </h1>

      </div>

    </div>
  );
}