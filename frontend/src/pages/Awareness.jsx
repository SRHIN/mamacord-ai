import { AlertOctagon, Ambulance, Package } from "lucide-react";

const cards = [
  {
    icon: AlertOctagon,
    color: "text-danger",
    bg: "bg-red-50 border-danger",
    title: "Danger Signs in Pregnancy",
    items: [
      "Severe headache that does not go away",
      "Blurred vision or seeing flashing lights",
      "Swelling of the face, hands, or feet",
      "Vaginal bleeding at any stage",
      "Baby not moving for more than 12 hours",
      "Difficulty breathing or chest pain",
      "High fever with shivering or chills",
      "Fits or loss of consciousness",
    ],
  },
  {
    icon: Ambulance,
    color: "text-warning",
    bg: "bg-yellow-50 border-warning",
    title: "Go to Hospital Immediately If...",
    items: [
      "You have any danger sign listed above",
      "Your baby's movements have reduced or stopped",
      "You have heavy bleeding (soaking more than one pad per hour)",
      "Your water breaks before 37 weeks",
      "You are having strong contractions before 37 weeks",
      "You have pain in your upper belly (under the ribs)",
      "You feel extremely unwell or cannot keep fluids down",
    ],
  },
  {
    icon: Package,
    color: "text-primary",
    bg: "bg-primary/5 border-primary/20",
    title: "What to Bring to a Referral",
    items: [
      "Antenatal card or maternity booklet",
      "Any medications you are taking",
      "A family member or trusted adult",
      "Money for transport and hospital fees",
      "Change of clothing and sanitary pads",
      "Any ultrasound scan results or lab reports",
      "Emergency contact numbers written on paper",
    ],
  },
];

export default function Awareness() {
  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="bg-primary text-white px-4 py-6 text-center">
        <h1 className="text-xl font-extrabold tracking-tight">Health Awareness</h1>
        <p className="text-accent text-sm mt-1">Know the signs. Act early. Save lives.</p>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-5">
        {cards.map(({ icon: Icon, color, bg, title, items }) => (
          <div key={title} className={`bg-white rounded-2xl shadow-sm border-2 ${bg} overflow-hidden`}>
            <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
              <Icon size={22} className={color} />
              <h2 className="font-extrabold text-gray-900 text-base">{title}</h2>
            </div>
            <ul className="px-4 py-3 space-y-2">
              {items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className={`font-bold ${color} mt-0.5`}>•</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className="text-center text-xs text-gray-400 mt-4 px-4">
          This information is for educational purposes. Always consult a qualified health worker for medical advice.
        </p>
      </div>
    </div>
  );
}
