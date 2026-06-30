export default function AdminSettingsPage() {
  return (
    <div className="md:pt-0 pt-14 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your store configuration</p>
      </div>

      <div className="glass-card rounded-2xl p-6 space-y-4">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider font-mono">Environment</h2>
        <p className="text-sm text-muted-foreground">
          Store settings are managed via environment variables in your <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">.env</code> file.
        </p>
        <div className="space-y-2 text-sm">
          {[
            { key: 'NOWPAYMENTS_API_KEY', desc: 'NOWPayments API key for crypto payments' },
            { key: 'NOWPAYMENTS_IPN_SECRET', desc: 'Webhook signature secret' },
            { key: 'CLOUDINARY_CLOUD_NAME', desc: 'Cloudinary cloud name for file storage' },
            { key: 'ADMIN_EMAIL', desc: 'Super admin email (cannot be changed here)' },
            { key: 'DOWNLOAD_TOKEN_EXPIRY_HOURS', desc: 'Download link expiry (default: 48h)' },
          ].map(({ key, desc }) => (
            <div key={key} className="flex gap-4 py-2 border-b border-border/50 last:border-0">
              <code className="font-mono text-xs text-primary w-64 flex-shrink-0">{key}</code>
              <span className="text-muted-foreground text-xs">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
