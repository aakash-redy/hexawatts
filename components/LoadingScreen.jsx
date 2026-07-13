import "./globals.css";
import PantherAnimation from "@/components/PantherAnimation";
import PageTransition from "@/components/PageTransition";

export const metadata = {
  title: "HEXAWATTS RACING TEAM | ENGINEERED FOR SPEED",
  description:
    "Hexawatts Racing Team — Engineering India's fastest collegiate electric racing machines. Precision, telemetry, and uncompromising performance.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <PantherAnimation
          size={850}
          opacity={0.75}
          glowColor="#00DCC8"
        />
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}