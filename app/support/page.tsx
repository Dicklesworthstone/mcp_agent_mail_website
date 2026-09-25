import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgentMail Companion Support",
  description: "Help and contact information for the AgentMail Companion iOS app.",
  alternates: { canonical: "/support" },
};

export default function SupportPage() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-6 pb-20 pt-32 text-slate-200">
      <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400">AgentMail Companion</p>
      <h1 className="mb-4 text-4xl font-black text-white sm:text-5xl">Support</h1>
      <p className="mb-12 text-slate-400">Help with pairing, subscriptions, and remote agent workflows.</p>

      <div className="space-y-10 leading-7">
        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">Connecting to your host</h2>
          <p>
            Confirm that your MCP Agent Mail host is running, your device has network access, and the connection method
            you selected in the app is available. If a pairing code expires, generate a new one on the host and pair
            again. The app&apos;s Device Management screen can replace a stale pairing.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">Subscriptions</h2>
          <p>
            Use Restore Purchases in the app if an existing subscription is not recognized. You can manage or cancel
            billing in your Apple account settings. Purchases are processed by Apple, not by the MCP Agent Mail host.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">Contact us</h2>
          <p>
            Email{" "}
            <a className="text-blue-400 underline underline-offset-4 hover:text-blue-300" href="mailto:jeff141421@gmail.com">
              jeff141421@gmail.com
            </a>{" "}
            with the app version, device model, and a description of the problem. Do not send pairing tokens, passwords,
            private messages, or other credentials in a support email.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">Privacy</h2>
          <p>
            Read the{" "}
            <a className="text-blue-400 underline underline-offset-4 hover:text-blue-300" href="/privacy">
              AgentMail Companion Privacy Policy
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
