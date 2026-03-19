import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for trying out",
    features: [
      "3 images per day",
      "Basic background removal",
      "Standard quality",
      "Web access only",
    ],
    cta: "Get Started",
    href: "/tools/remove-background",
    popular: false,
  },
  {
    name: "Pro Monthly",
    price: "$9.9",
    period: "/month",
    description: "Best for individuals",
    features: [
      "100 images per day",
      "All features included",
      "High quality",
      "Priority processing",
      "Email support",
    ],
    cta: "Start Free Trial",
    href: "/dashboard",
    popular: true,
  },
  {
    name: "Pro Yearly",
    price: "$79",
    period: "/year",
    description: "Save 33%",
    features: [
      "Unlimited images",
      "All features included",
      "Premium quality",
      "Priority processing",
      "Priority support",
      "API access",
    ],
    cta: "Start Free Trial",
    href: "/dashboard",
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-gray-600">
          Choose the plan that's right for you
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`bg-white rounded-2xl p-8 ${
              plan.popular
                ? "ring-2 ring-indigo-600 shadow-xl scale-105"
                : "shadow-lg"
            }`}
          >
            {plan.popular && (
              <span className="inline-block bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                MOST POPULAR
              </span>
            )}
            
            <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold text-gray-900">
                {plan.price}
              </span>
              {plan.period && (
                <span className="text-gray-500 ml-1">{plan.period}</span>
              )}
            </div>
            <p className="text-gray-500 mt-2">{plan.description}</p>

            <ul className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href={plan.href} className="block mt-8">
              <Button
                className={`w-full ${
                  plan.popular
                    ? "bg-indigo-600 hover:bg-indigo-700"
                    : "bg-gray-900 hover:bg-gray-800"
                }`}
              >
                {plan.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-500">
          Need a custom solution?{" "}
          <a href="mailto:support@aiimagestudio.com" className="text-indigo-600 hover:underline">
            Contact us
          </a>
        </p>
      </div>
    </div>
  )
}
