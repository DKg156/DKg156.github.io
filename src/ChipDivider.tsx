/**
 * A purely decorative, faint microchip motif placed in the whitespace
 * at section transitions. No content, assets, or scroll behavior changes.
 */
export default function ChipDivider(){
 return <div className="chip-divider" aria-hidden="true">
  <svg viewBox="0 0 440 76" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" focusable="false">
   <path d="M202 30h-34l-20-19H90L76 24H18 M202 38h-57l-18 9H62L49 62H12 M202 46h-20l-16 16h-54"/>
   <path d="M238 30h34l20-19h58l14 13h58 M238 38h57l18 9h65l13 15h37 M238 46h20l16 16h54"/>
   <path d="M211 19v-8h-13 M220 19V5 M229 19v-8h13 M211 57v8h-13 M220 57v14 M229 57v8h13"/>
   <rect x="202" y="19" width="36" height="38" rx="4" strokeWidth="1.8"/>
   <rect x="210" y="27" width="20" height="22" rx="2"/>
   <path d="M216 33h8v10h-8z M196 30h6 M196 38h6 M196 46h6 M238 30h6 M238 38h6 M238 46h6"/>
   <circle cx="18" cy="24" r="3"/><circle cx="12" cy="62" r="3"/><circle cx="112" cy="62" r="2.5"/>
   <circle cx="422" cy="24" r="3"/><circle cx="428" cy="62" r="3"/><circle cx="328" cy="62" r="2.5"/>
   <circle cx="220" cy="5" r="2.5"/><circle cx="220" cy="71" r="2.5"/>
  </svg>
 </div>;
}
