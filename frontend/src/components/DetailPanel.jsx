import { Check, X, Mail, Phone, Linkedin, Github, Link2 } from "lucide-react";

const CONTACT_META = [
  { key: "email", label: "Email", icon: Mail },
  { key: "phone", label: "Phone", icon: Phone },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin },
  { key: "github", label: "GitHub", icon: Github },
  { key: "portfolio", label: "Portfolio link", icon: Link2 },
];

export default function DetailPanel({ contact, skills }) {
  return (
    <div className="rounded-xl border border-line bg-paper p-6">
      <h3 className="font-display font-semibold text-ink">Resume analysis</h3>

      <div className="mt-5">
        <p className="text-sm font-medium text-ink mb-2.5">Personal information detected</p>
        <div className="flex flex-wrap gap-2">
          {CONTACT_META.map(({ key, label, icon: Icon }) => {
            const present = contact[key];
            return (
              <span
                key={key}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  present ? "bg-good-soft text-good" : "bg-panel text-ink-soft"
                }`}
              >
                <Icon size={12} />
                {label}
                {present ? <Check size={11} /> : <X size={11} />}
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-5 grid sm:grid-cols-2 gap-5">
        <div>
          <p className="text-sm font-medium text-ink mb-2">Technical skills found</p>
          {skills.technical.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {skills.technical.map((s) => (
                <span key={s} className="rounded-md bg-panel px-2 py-1 text-xs text-ink">{s}</span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-soft">No recognized technical skills found — consider adding a clear skills section.</p>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-ink mb-2">Soft skills found</p>
          {skills.soft.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {skills.soft.map((s) => (
                <span key={s} className="rounded-md bg-panel px-2 py-1 text-xs text-ink">{s}</span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-ink-soft">No explicit soft skills detected in the text.</p>
          )}
        </div>
      </div>
    </div>
  );
}
