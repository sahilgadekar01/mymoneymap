import { Phone, Mail, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          {/* Contact Info */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 mb-3">Contact Us</h4>
            <div className="flex items-center space-x-2 text-slate-600">
              <Phone className="w-4 h-4" />
              <span>+91 8308895845</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-600">
              <Mail className="w-4 h-4" />
              <a href="mailto:gadekarsahil01@gmail.com" className="hover:text-primary">
                gadekarsahil01@gmail.com
              </a>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 mb-3">Disclaimer</h4>
            <p className="text-slate-600 text-xs leading-relaxed">
              Calculations provided are for educational purposes only. Please consult a financial advisor for personalized advice.
            </p>
          </div>

          {/* Support Us */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 mb-3 flex items-center space-x-1">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Support Us</span>
            </h4>
            <p className="text-slate-600 text-xs leading-relaxed mb-2">
              If you find MoneyMap helpful, consider supporting us via UPI:
            </p>
            <div className="bg-slate-50 p-2 rounded text-center">
              <span className="font-mono text-xs text-slate-700">sahilgadekar13@ybl</span>
            </div>
            <p className="text-slate-500 text-xs">
              Thanks for helping us keep this tool free and useful!
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            © 2025 MoneyMap. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}