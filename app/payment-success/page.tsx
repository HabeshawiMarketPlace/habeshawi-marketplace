export default function PaymentSuccessPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center p-8 text-center">
      <div className="rounded-2xl bg-white p-10 shadow-lg">
        <h1 className="text-4xl font-bold text-green-700">
          🎉 Payment Successful!
        </h1>

        <p className="mt-6 text-lg text-gray-700">
          Thank you for your payment.
        </p>

        <p className="mt-2 text-gray-600">
          Your listing has been received and is awaiting review by our team.
        </p>

        <a
          href="/"
          className="mt-8 inline-block rounded-lg bg-[#087531] px-6 py-3 font-semibold text-white hover:bg-[#064d2b]"
        >
          Return to Home
        </a>
      </div>
    </main>
  );
}