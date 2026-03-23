import { Button } from "@/components/ui/button"
import { Check, Zap, Calendar, CreditCard } from "lucide-react"
import Link from "next/link"

const plans = [
  {
    name: "免费试用",
    price: "¥0",
    description: "首次使用免费",
    features: [
      "1 次免费处理",
      "标准质量",
      "适合体验",
    ],
    cta: "开始体验",
    href: "/tools/remove-background",
    icon: Zap,
    popular: false,
    bg: "bg-gradient-to-br from-green-50 to-emerald-50",
  },
  {
    name: "按量充值",
    price: "¥0.99",
    description: "按需付费",
    features: [
      "¥0.99 / 张",
      "无时间限制",
      "标准质量",
      "随时可用",
    ],
    cta: "立即充值",
    href: "/tools/remove-background",
    icon: CreditCard,
    popular: true,
    bg: "bg-gradient-to-br from-indigo-50 to-purple-50",
  },
  {
    name: "月度会员",
    price: "¥29.9",
    period: "/月",
    description: "适合频繁使用",
    features: [
      "每天 50 张",
      "高清质量",
      "优先处理",
      "专属客服",
    ],
    cta: "立即订阅",
    href: "/dashboard",
    icon: Calendar,
    popular: false,
    bg: "bg-gradient-to-br from-orange-50 to-amber-50",
  },
  {
    name: "年度会员",
    price: "¥299",
    period: "/年",
    description: "超值优惠",
    features: [
      "每天 100 张",
      "超清质量",
      "优先处理",
      "专属客服",
      "专属折扣",
    ],
    cta: "立即订阅",
    href: "/dashboard",
    icon: Calendar,
    popular: false,
    bg: "bg-gradient-to-br from-blue-50 to-cyan-50",
  },
]

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          💰 选择适合您的方案
        </h1>
        <p className="text-xl text-gray-600">
          按需选择，灵活付费
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const Icon = plan.icon
          return (
            <div
              key={plan.name}
              className={`${plan.bg} rounded-2xl p-6 ${
                plan.popular
                  ? "ring-2 ring-indigo-600 shadow-xl"
                  : "shadow-lg"
              }`}
            >
              {plan.popular && (
                <span className="inline-block bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                  推荐
                </span>
              )}
              
              <div className="flex items-center gap-2 mb-4">
                <Icon className="w-6 h-6 text-gray-700" />
                <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              </div>
              
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-gray-900">
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                )}
              </div>
              <p className="text-gray-500 text-sm mt-1">{plan.description}</p>

              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={plan.href} className="block mt-6">
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
          )
        })}
      </div>

      <div className="text-center mt-12">
        <p className="text-gray-500">
          需要定制方案？{" "}
          <a href="mailto:support@aiimagestudio.com" className="text-indigo-600 hover:underline">
            联系我们
          </a>
        </p>
      </div>
    </div>
  )
}
