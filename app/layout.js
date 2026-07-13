import "./globals.css";
import PantherAnimationWrapper from "@/components/Pantheranimationwrapper";

export const metadata = {
  title: "HEXAWATTS RACING TEAM | ENGINEERED FOR SPEED",
  description:
    "Hexawatts Racing Team — Engineering India's fastest collegiate electric racing machines. Precision, telemetry, and uncompromising performance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black">
        <PantherAnimationWrapper
          size={850}
          opacity={0.75}
          glowColor="#00DCC8"
        />
        {children}
      </body>
    </html>
  );
}