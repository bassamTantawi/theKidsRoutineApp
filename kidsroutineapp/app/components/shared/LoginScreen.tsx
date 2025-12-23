"use client";

export function LoginScreen() {
  const handleLoginClick = () => {
    // Dummy handler - does nothing for now
    console.log("Login clicked (dummy)");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-100 via-sky-100 to-emerald-100 font-sans text-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl ring-1 ring-black/10 p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
              Welcome!
            </h1>
            <p className="text-sm text-zinc-600">
              Scan the QR code or use the login link to access your routine board
            </p>
          </div>

          {/* QR Code Placeholder */}
          <div className="flex justify-center">
            <div className="w-64 h-64 bg-zinc-100 rounded-2xl flex items-center justify-center border-4 border-dashed border-zinc-300">
              <div className="text-center space-y-2">
                <svg
                  className="w-24 h-24 mx-auto text-zinc-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                  />
                </svg>
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                  QR Code
                </p>
              </div>
            </div>
          </div>

          {/* Login Link/Button */}
          <div className="space-y-3">
            <button
              onClick={handleLoginClick}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-600 to-sky-600 text-white font-extrabold text-sm shadow-lg hover:from-emerald-700 hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 transition-all"
            >
              Login Link
            </button>
            <p className="text-xs text-center text-zinc-500">
              Click the button above to login (dummy - no action yet)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

