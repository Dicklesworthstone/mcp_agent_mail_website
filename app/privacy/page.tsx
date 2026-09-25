import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgentMail Companion Privacy Policy",
  description: "Privacy information for the AgentMail Companion iOS app.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <main id="main-content" tabIndex={-1} className="mx-auto max-w-3xl px-6 pb-20 pt-32 text-slate-200">
      <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-blue-400">AgentMail Companion</p>
      <h1 className="mb-4 text-4xl font-black text-white sm:text-5xl">Privacy Policy</h1>
      <p className="mb-12 text-sm text-slate-400">Effective September 25, 2026</p>

      <div className="space-y-10 leading-7">
        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">What the app does</h2>
          <p>
            AgentMail Companion connects your iPhone or iPad to an agent-workflow host that you choose and configure.
            It sends the messages and commands you initiate to that host and displays the host&apos;s responses.
            The host operator controls the host and its data-retention practices.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">Information on your device</h2>
          <p>
            The app keeps connection settings, credentials, preferences, and cached workflow information on your device
            so that it can reconnect and display your work. Sensitive credentials use iOS-provided secure storage.
            You can remove the app and its local data through iOS. Data held by a host must be managed on that host.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">Network services</h2>
          <p>
            The app communicates with your configured host. If you choose a connectivity provider such as Cloudflare
            Tunnel or Tailscale, that provider may process connection traffic under its own terms. If you enable push
            notifications, Apple Push Notification service delivers notification metadata to your device. Subscription
            purchases and billing are handled by Apple through the App Store. We do not use advertising SDKs in the app.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">Your choices</h2>
          <p>
            You choose which host to pair, whether to enable notifications, and whether to purchase a subscription.
            You can manage or cancel a subscription in your Apple account settings. You can disconnect or replace a
            paired device in the app&apos;s device-management controls.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">Children and changes</h2>
          <p>
            This developer tool is not directed to children under 13. We may update this policy as the app changes;
            the effective date above will change when we do.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-2xl font-bold text-white">Contact</h2>
          <p>
            Questions about this policy can be sent to{" "}
            <a className="text-blue-400 underline underline-offset-4 hover:text-blue-300" href="mailto:jeff141421@gmail.com">
              jeff141421@gmail.com
            </a>.
          </p>
        </section>
      </div>
    </main>
  );
}
