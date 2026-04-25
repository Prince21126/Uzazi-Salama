
const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Reverse script 2 first (since it was applied later)
code = code.replace(/bg-white\/70/g, 'bg-gray-900/80');
code = code.replace(/bg-white\/80/g, 'bg-gray-900/90');
// The ones that were changed from bg-transparent are actually from bg-gray-900 
// because script 1 changed bg-gray-900 to bg-transparent
// So let's restore bg-transparent to bg-gray-900 first, and others:
code = code.replace(/bg-transparent/g, 'bg-gray-900');
code = code.replace(/bg-white\/60 backdrop-blur-xl border border-white\/50 rounded-3xl shadow-geometric/g, 'glass-panel');
code = code.replace(/bg-\[\#A3B18A\] text-white hover:bg-\[\#588157\]/g, 'bg-brand-primary');
code = code.replace(/text-\[\#588157\]/g, 'text-brand-primary'); // (might conflict with text-gray-400 or 300, let's fix manually)

// Reverse script 1
code = code.replace(/text-\[\#344E41\]/g, 'text-white');
// text-[#588157] was used for both text-gray-400 and text-gray-300 AND text-brand-primary. This is ambiguous. Let's just make it text-gray-300 and we'll see.
code = code.replace(/text-\[\#588157\]\/70/g, 'text-gray-500');
code = code.replace(/bg-white\/40/g, 'bg-white/5');
code = code.replace(/bg-white\/60/g, 'bg-white/10'); // This conflicts but let's see. Better to replace specific classes manually if needed.
code = code.replace(/border-\[\#A3B18A\]\/30/g, 'border-white/5');
code = code.replace(/border-\[\#A3B18A\]\/50/g, 'border-white/10');
code = code.replace(/from-\[\#e3e9d8\] via-\[\#FAEDEA\] to-\[\#FAEDEA\]/g, 'from-green-900/20 via-gray-900 to-gray-900');
code = code.replace(/bg-white\/20/g, 'bg-black/20');
code = code.replace(/bg-white\/50/g, 'bg-black/50');
code = code.replace(/shadow-xl shadow-\[\#A3B18A\]\/20/g, 'shadow-xl shadow-black/20');
code = code.replace(/shadow-2xl shadow-\[\#A3B18A\]\/30/g, 'shadow-2xl shadow-black/50');

fs.writeFileSync('src/App.tsx', code);
