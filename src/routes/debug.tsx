```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/debug")({
  component: DebugPage,
});

function DebugPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1>Debug</h1>

      <pre>
        {JSON.stringify(
          {
            VITE_SUPABASE_URL:
              import.meta.env.VITE_SUPABASE_URL,

            VITE_SUPABASE_PUBLISHABLE_KEY:
              import.meta.env
                .VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          null,
          2
        )}
      </pre>
    </div>
  );
}
```
