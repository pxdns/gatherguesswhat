import { brand } from "@nexa/branding";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">{brand.name}</h1>
          <a
            href="https://app.nexachat.local:3000"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Launch App
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-5xl font-bold mb-4">{brand.tagline}</h2>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {brand.description}
        </p>
        <div className="flex gap-4 justify-center">
          <a
            href="https://app.nexachat.local:3000"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Get Started
          </a>
          <a
            href="#features"
            className="px-8 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
          >
            Learn More
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-center mb-12">Features</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Communities",
                desc: "Create and manage communities for any purpose",
              },
              {
                title: "Real-time Messaging",
                desc: "Instant communication with advanced features",
              },
              {
                title: "Liquid Glass Design",
                desc: "Beautiful modern interface with smooth animations",
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white p-6 rounded-lg shadow">
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 {brand.company}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
