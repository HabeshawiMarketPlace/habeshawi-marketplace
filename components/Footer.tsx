import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#064d2b] text-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h2 className="text-3xl font-black text-yellow-400">
              ሐበሻዊ
            </h2>

            <p className="mt-2 text-2xl font-bold">
              Habeshawi Marketplace
            </p>

            <p className="mt-1 text-sm text-yellow-300">
              The Ethiopian Community Marketplace
            </p>

            <p className="mt-5 leading-7 text-green-100">
              Connecting the Habesha Community through buying, selling,
              housing, jobs, businesses, and community services.
            </p>

            <div className="mt-6 flex h-2 overflow-hidden rounded-full">
              <div className="w-1/3 bg-green-500" />
              <div className="w-1/3 bg-yellow-400" />
              <div className="w-1/3 bg-red-500" />
            </div>
          </div>

          {/* Marketplace */}
          <div>
            <h3 className="text-xl font-bold text-yellow-300">
              Marketplace
            </h3>

            <div className="mt-5 space-y-3">
              <Link
                href="/marketplace"
                className="block hover:text-yellow-300"
              >
                🛒 Marketplace
              </Link>

              <Link
                href="/marketplace"
                className="block hover:text-yellow-300"
              >
                🚗 Cars
              </Link>

              <Link
                href="/marketplace"
                className="block hover:text-yellow-300"
              >
                📱 Electronics
              </Link>

              <Link
                href="/marketplace"
                className="block hover:text-yellow-300"
              >
                🛋 Furniture
              </Link>

              <Link
                href="/services"
                className="block hover:text-yellow-300"
              >
                🧰 Services
              </Link>

              <Link
                href="/post-ad"
                className="block hover:text-yellow-300"
              >
                📢 Post an Ad
              </Link>
            </div>
          </div>

          {/* Housing */}
          <div>
            <h3 className="text-xl font-bold text-yellow-300">
              Housing
            </h3>

            <div className="mt-5 space-y-3">
              <Link
                href="/housing/rooms"
                className="block hover:text-yellow-300"
              >
                🛏 Rooms
              </Link>

              <Link
                href="/housing/apartments"
                className="block hover:text-yellow-300"
              >
                🏢 Apartments
              </Link>

              <Link
                href="/housing/houses"
                className="block hover:text-yellow-300"
              >
                🏡 Houses
              </Link>

              <Link
                href="/housing/roommates"
                className="block hover:text-yellow-300"
              >
                👥 Roommates
              </Link>

              <Link
                href="/housing"
                className="block hover:text-yellow-300"
              >
                🏬 Commercial
              </Link>
            </div>
          </div>

          {/* Advertisers */}
          <div>
            <h3 className="text-xl font-bold text-yellow-300">
              For Advertisers
            </h3>

            <div className="mt-5 space-y-3">
              <Link
                href="/post-ad"
                className="block hover:text-yellow-300"
              >
                📢 Post an Ad
              </Link>

              <Link
                href="/pricing"
                className="block hover:text-yellow-300"
              >
                💳 Pricing
              </Link>

              <Link
                href="/promotion"
                className="block hover:text-yellow-300"
              >
                ⭐ Promotions
              </Link>

              <Link
                href="/contact"
                className="block hover:text-yellow-300"
              >
                📞 Contact Sales
              </Link>

              <Link
                href="/about"
                className="block hover:text-yellow-300"
              >
                ℹ️ About Us
              </Link>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 border-t border-white/20 pt-8">
          <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
            <div className="space-y-2 text-green-100">
              <p>☎ 240-391-8621</p>
              <p>✉ habeshawi2023@gmail.com</p>
              <p>📍 Washington DC • Maryland • Virginia</p>
            </div>

            <div className="text-center lg:text-right">
              <p className="font-semibold text-yellow-300">
                Follow Us
              </p>

              <div className="mt-3 flex justify-center gap-5 text-2xl lg:justify-end">
                <span>📘</span>
                <span>📸</span>
                <span>💬</span>
                <span>🎵</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-white/20 pt-6 text-center">
          <p className="font-semibold">
            © {new Date().getFullYear()} Habeshawi Marketplace. All Rights
            Reserved.
          </p>

          <p className="mt-2 text-green-100">
            Connecting the Habesha Community
          </p>

          <div className="mx-auto mt-5 flex h-2 max-w-md overflow-hidden rounded-full">
            <div className="w-1/3 bg-green-500" />
            <div className="w-1/3 bg-yellow-400" />
            <div className="w-1/3 bg-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}