import { useState } from 'react';
import { Leaf, Info, Sparkles, ChevronRight, ChevronLeft, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

interface AnalogyStage {
  id: string;
  minWeek: number;
  maxWeek: number;
  emoji: string;
  gradient: string;
  translations: {
    FR: {
      name: string;
      description: string;
      nutritionTip: string;
    };
    SW: {
      name: string;
      description: string;
      nutritionTip: string;
    };
    MSH: {
      name: string;
      description: string;
      nutritionTip: string;
    };
  };
  lengthCm: number;
  weightG: number;
}

const analogyStages: AnalogyStage[] = [
  {
    id: 'sesame',
    minWeek: 1,
    maxWeek: 7,
    emoji: "🌱",
    gradient: "from-emerald-500/10 to-teal-500/15",
    translations: {
      FR: {
        name: "Petite Graine de Sésame",
        description: "Votre bébé est encore minuscule mais plein de force ! Il fait la taille d’une graine de sésame noire que l'on cultive sur les collines fertiles du Kivu.",
        nutritionTip: "Le sésame est riche en fer et complémente idéalement votre apport en acide folique pour prévenir les malformations précoces."
      },
      SW: {
        name: "Mbegu ya Ufuta",
        description: "Mtoto wako bado ni mdogo sana lakini amejaa nguvu ! Sawa na mbegu ya ufuta mweusi unaolimwa kwenye vilima vya Kivu.",
        nutritionTip: "Ufuta umejaa madini ya chuma na inakusaidia kuongeza nguvu mapema katika ukuaji wa mtoto."
      },
      MSH: {
        name: "Mbege ye Kiyuku",
        description: "Omwana wawe achili muke bwenene, anagana mbege ye kiyuku kintu bikuza h’ebilima byerhu bye Kivu.",
        nutritionTip: "Kiyuku kinali amagala manji g'okuyongera mashi m'obuliri lyo omwana akula bwinja."
      }
    },
    lengthCm: 0.5,
    weightG: 0.1
  },
  {
    id: 'bishimbo',
    minWeek: 8,
    maxWeek: 11,
    emoji: "🫘",
    gradient: "from-red-500/10 to-orange-500/15",
    translations: {
      FR: {
        name: "Graine de Haricot (Bishimbo)",
        description: "Le fœtus est maintenant comparable à une graine de haricot rouge local, le fameux 'Bishimbo'. C'est le début de la formation de ses petits doigts et de ses orteils.",
        nutritionTip: "Le haricot de Katana ou Walungu est une source végétale royale de protéines et de fer, fondamentaux pour le développement du placenta."
      },
      SW: {
        name: "Mbegu ya Maharagwe (Bishimbo)",
        description: "Mtoto sasa anafanana na mbegu ya haragwe jekundu la kienyeji letu mashuhuri 'Bishimbo'. Vidole vyake vidogo vinaanza kujitokeza.",
        nutritionTip: "Haragwe letu linatoa nguvu na protini za asili kukuza nyama na mifupa ya mtoto."
      },
      MSH: {
        name: "Mbege ye Bishimbo Kyenene",
        description: "Omwana ali kuli mbege ye bishimbo byerhu bihimbiye bya lelo. Amasiga n'amano byage bilire okurhondereza okuboneka.",
        nutritionTip: "Bishimbo byerhu by'omunda binayongera endulo m'olubiri lwa maman lyo omwana anyirira bwinja."
      }
    },
    lengthCm: 3.5,
    weightG: 4
  },
  {
    id: 'safou',
    minWeek: 12,
    maxWeek: 15,
    emoji: "🫐",
    gradient: "from-purple-500/10 to-violet-500/15",
    translations: {
      FR: {
        name: "Prune de Safou",
        description: "Bébé a désormais la taille d'un Safou violacé de nos arbres de Mwenga. Il commence à faire des mouvements fluides mais encore imperceptibles !",
        nutritionTip: "Le Safou contient des acides gras insaturés excellents pour le développement cellulaire et le système nerveux de bébé."
      },
      SW: {
        name: "Tunda la Safou d'Idjwi",
        description: "Mtoto wako sasa ana ukubwa wa Safou ya zambarau kutoka milimani. Anaanza kujisogeza japo bado huwezi kumsikia vizuri !",
        nutritionTip: "Safou ina mafuta mazuri ya asili yanayohitajika kukuza ubongo na mishipa ya mtoto mchanga."
      },
      MSH: {
        name: "Isafou y'e Mwenga",
        description: "Omwana m’inda agana Isafou nshibe lye handi Mwenga. Arhondire okuyungana omunda halali ogwerhali omusimba.",
        nutritionTip: "Isafou erhi mbege ya Safou enali amashizi mampa go kuyerekaza obwonye b'omwana bwinji bwanji."
      }
    },
    lengthCm: 9,
    weightG: 45
  },
  {
    id: 'citron',
    minWeek: 16,
    maxWeek: 19,
    emoji: "🍋",
    gradient: "from-amber-500/10 to-yellow-500/15",
    translations: {
      FR: {
        name: "Citron de Mwenga",
        description: "Bébé atteint la taille d'un joli citron des collines. Ses oreilles se déplacent vers leur position définitive et son cœur bat très distinctement.",
        nutritionTip: "Un verre d'eau citronnée tiède le matin aide à réduire la constipation et apporte la vitamine C nécessaire pour fixer le fer des aliments."
      },
      SW: {
        name: "Ndimu yenye juisi ya Mwenga",
        description: "Mtoto anafikia ukubwa wa ndimu safi. Masikio yake yanakaa nafasi yake vizuri na moyo unapiga kwa nguvu na kwa usawa.",
        nutritionTip: "Maji yenye limau hutoa kinga mwilini (Vitamine C) na kusaidia kupunguza kichefuchefu asubuhi."
      },
      MSH: {
        name: "Indimu mpa ye Mwenga",
        description: "Omwana lero agana indimu mbole ye Mwenga. Amasire garherekire bwinja, n'umutima guli kuduga bwinji bwo.",
        nutritionTip: "Amishi g’indimu gali amagala banji m'olyose lyo olungu lwa maman luyunja kuhuguka n'okushinga."
      }
    },
    lengthCm: 14,
    weightG: 150
  },
  {
    id: 'avocado',
    minWeek: 20,
    maxWeek: 24,
    emoji: "🥑",
    gradient: "from-lime-500/10 to-emerald-500/15",
    translations: {
      FR: {
        name: "Avocat local d'Uvira",
        description: "Une taille magnifique ! Votre bébé fait la taille d’un avocat crémeux d'Uvira. Il commence à entendre votre voix et les battements de votre cœur d'une façon claire.",
        nutritionTip: "L'avocat de chez nous est riche en potassium et en vitamine E, conseillé pour assouplir la peau et prévenir les vergetures naturellement."
      },
      SW: {
        name: "Parachichi ya Uvira",
        description: "Ukubwa mzuri sana ! Mtoto anafanana na parachichi tamu la Uvira. Anaanza kusikia sauti ya mama na hata mapigo yako ya moyo !",
        nutritionTip: "Parachichi linaongeza damu na nishati safi kwa kukuza ngozi laini ya mtoto."
      },
      MSH: {
        name: "Iparachichi ry'Idjwi",
        description: "Omwana lero agana iparachichi linona lya Bukavu. Arhondire okuyunva oburhe we dadi na maman bagera.",
        nutritionTip: "Iparachichi rinali endulo ye vitamin E eyerekera olubiri lye maman lyo luyerageza kurhenduka."
      }
    },
    lengthCm: 29,
    weightG: 480
  },
  {
    id: 'mais',
    minWeek: 25,
    maxWeek: 29,
    emoji: "🌽",
    gradient: "from-yellow-600/10 to-amber-500/15",
    translations: {
      FR: {
        name: "Épi de Maïs de Walungu",
        description: "Grand et vigoureux ! Bébé fait la taille d'un bel épi de maïs jaune de Walungu. Ses cheveux commencent à pousser et il ouvre doucement les yeux pour la première fois.",
        nutritionTip: "Le maïs bouilli ou en bouillie traditionnelle apporte des fibres alimentaires complètes et de l'énergie pour soutenir le poids maternel sans excès."
      },
      SW: {
        name: "Muhindi Mtamu wa Walungu",
        description: "Mrefu na mwenye nguvu ! Mtoto ana ukubwa wa muhindi mzuri wa Walungu. Nywele zake zinaanza kumea na anafungua macho yake sasa.",
        nutritionTip: "Uji au mihindi ya kuchemsha inakupa nguvu kamili unayohitaji usisikie unyonge vilimani."
      },
      MSH: {
        name: "Igisaka kye Kihindi we Walungu",
        description: "Omwana agana igisaka kye kihindi mpa we Walungu. Olushere lwrhondire okukurha, nanali kuyunza amasire buno buno.",
        nutritionTip: "Obuhembe bwe gombo bwinja bunongera ezingvu z’okuyimanga collines zerhu kunu handi Murhesa rhwo."
      }
    },
    lengthCm: 37,
    weightG: 850
  },
  {
    id: 'ananas',
    minWeek: 30,
    maxWeek: 33,
    emoji: "🍍",
    gradient: "from-amber-600/10 to-orange-400/15",
    translations: {
      FR: {
        name: "Ananas de Kalehe",
        description: "Une croissance radieuse au bord du Lac Kivu ! Bébé fait la taille d’un ananas mûr de Kalehe. Il s'entraîne activement à respirer et son cerveau se développe à pas géants.",
        nutritionTip: "L'ananas frais de Kalehe est idéal pour la digestion après les repas lourds, mais consommez-le avec modération comme toute gâterie sucrée."
      },
      SW: {
        name: "Nanasi ya Kalehe",
        description: "Anakua vizuri kabisa ! Mtoto amefikia uzito wa nanasi tamu la Kalehe. Anajizoeza kupumua na mfumo wa fahamu unakamilika kwa haraka.",
        nutritionTip: "Nanasi inasaidia kuyeyusha chakula tumboni baada ya milo mizito."
      },
      MSH: {
        name: "Inanasi izibo ye Kalehe",
        description: "Inyula enja nka muli m’inyoleze inanasi ye Kalehe. Omwana asimbiire okujisoma kukulikiriza amishi, umubiri gwage guli kukulukira.",
        nutritionTip: "Inanasi iduga amagala ganji g'okuhashya endulo mu munda rhungogomera bidula."
      }
    },
    lengthCm: 42,
    weightG: 1600
  },
  {
    id: 'manioc',
    minWeek: 34,
    maxWeek: 36,
    emoji: "🍠",
    gradient: "from-stone-600/10 to-yellow-800/15",
    translations: {
      FR: {
        name: "Tubercule de Manioc de Kabare",
        description: "Le pilier de la force locale ! Bébé a la taille et la densité d'un solide tubercule de manioc de Kabare. Ses poumons sont presque matures et il se tourne souvent vers le bas en position de naissance.",
        nutritionTip: "Préparez votre farine de manioc (Foufou) mélangée avec du sorgho ou du maïs pour assurer un apport riche en acides aminés durant le dernier mois."
      },
      SW: {
        name: "Kiziba cha Muhogo wa Kabare",
        description: "Chanzo cha nguvu ya collines ! Mtoto amefikia ukubwa wa muhogo mkubwa wa Kabare. Mapafu yake yanakamilika kabisa na ameanza geuka chini kuelekea mlango wa uzazi.",
        nutritionTip: "Chakula cha Muhogo (Ugali/Foufou) kigepangiwe na mboga za asili ('Dodo') ili uwe na damu na nguvu ya kutosha kwa ajili ya leba."
      },
      MSH: {
        name: "Muhogo mushibe gwe Kabare",
        description: "Ushinda bwinji bwo ! Omwana agana muhogo gubazire gwa Kabare. Amasosi rage gali gazinda kumalika h’emulongo gwe lufuatu.",
        nutritionTip: "Ubugali bwe muhogo bugerekeze n'ebisogo lyo olubiri lwa maman luhamata bwinja mumuheruka."
      }
    },
    lengthCm: 47,
    weightG: 2350
  },
  {
    id: 'banana',
    minWeek: 37,
    maxWeek: 42,
    emoji: "🍌",
    gradient: "from-yellow-400/10 to-orange-500/15",
    translations: {
      FR: {
        name: "Régime de Bananes de Bukavu",
        description: "Prêt pour la fête d'accueil ! Bébé fait la taille d'un beau régime complet de bananes de nos collines. Il a accumulé de bonnes réserves de graisse protectrice et est pleinement prêt pour le grand voyage de la naissance.",
        nutritionTip: "C'est l'étape ultime. Les bananes plantains cuites (Ndizi) sont chargées d'énergie pour soutenir le travail actif et vous donner la force nécessaire."
      },
      SW: {
        name: "Mkungu wa Ndizi za Bukavu",
        description: "Tayari kwa sherehe ya kuwasili ! Mtoto amefikia uzito wa mkungu mzuri wa ndizi za Bukavu. Ana afya kamili na yuko tayari kabisa kuja ulimwenguni !",
        nutritionTip: "Mlo wa ndizi za kupika ('ndizi choma/mchemsho') unakupa nishati safi kujiandaa na ushushaji wa mtoto salama."
      },
      MSH: {
        name: "Idamba lye Bitoke bye Bukavu",
        description: "Omwana amazinda kuyunja bulyo damba lye bitoke bishemere by’oBukavu. Amagala wage gali gose masalala n'okuyungana kuli k'okuhisira.",
        nutritionTip: "Ebitoke bishebe byo kutanga binahashya emikazo n’olubi lwa maman mu lufuetu lwenene."
      }
    },
    lengthCm: 51,
    weightG: 3400
  }
];

// South Kivu childbirth traditional cultural trivia translations
const culturalTrivia = {
  FR: {
    title: "Le saviez-vous ? (Kuhunza au Kivu)",
    insight: "Au Sud-Kivu, après l'accouchement, la communauté pratique le 'Kuhunza' : les familles et voisines apportent des régimes de bananes plantains, du lait frais de Masisi et des haricots rouges pour préparer des bouillies nourrissantes pour la jeune maman. C'est l'expression ultime de la solidarité maternelle congolaise."
  },
  SW: {
    title: "Je, unajua ? (Kuhunza katika Kivu)",
    insight: "Katika jimbo letu la Kivu, baada ya mama kujifungua, jamii hushiriki mila ya 'Kuhunza' : jamaa na majirani huleta mikungu ya ndizi, maziwa safi na maragwe ili kuandaa milo yenye nguvu ya kumrudishia mama damu. Hiyo ndiyo nguvu ya umoja wa akina mama !"
  },
  MSH: {
    title: "Obumenye bwerhu (Kuhunza m'omuli mwa Kivu)",
    insight: "M'olubiri lwerhu lwe Kivu, olufuatu lwamala, abantu bahigira bwa 'Kuhunza' barhangirira ebitoke, bulyo bwe mashi mampa lyo bashemya maman n'omwana wage mparhi eyirekeza embakulo yerhu."
  }
};

export default function BabySizeAnalogy({ weeksPregnant, language }: { weeksPregnant: number, language: Language }) {
  const currentStage = analogyStages.find(
    s => weeksPregnant >= s.minWeek && weeksPregnant <= s.maxWeek
  ) || analogyStages[analogyStages.length - 1];

  const [activeStageId, setActiveStageId] = useState<string>(currentStage.id);

  const selectedStage = analogyStages.find(s => s.id === activeStageId) || currentStage;
  const tLocal = selectedStage.translations[language as keyof typeof selectedStage.translations] || selectedStage.translations.FR;
  const trivia = culturalTrivia[language as keyof typeof culturalTrivia] || culturalTrivia.FR;

  const currentIndex = analogyStages.findIndex(s => s.id === activeStageId);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setActiveStageId(analogyStages[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < analogyStages.length - 1) {
      setActiveStageId(analogyStages[currentIndex + 1].id);
    }
  };

  const selectedIsCurrent = weeksPregnant >= selectedStage.minWeek && weeksPregnant <= selectedStage.maxWeek;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-6 text-white border border-white/5 shadow-2xl relative overflow-hidden">
      {/* Visual background ambient details */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full filter blur-[50px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-amber-500/5 rounded-full filter blur-[60px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center">
            <Leaf size={22} className="animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white border-none">
              {language === 'SW' ? 'Ukubwa wa Baby (Kivu Agri)' : language === 'MSH' ? 'Obuzito b’omwana (Agri Kivu)' : 'Taille de Bébé (Analogies Locales)'}
            </h3>
            <p className="text-[10px] text-emerald-400/80 font-black tracking-widest uppercase">
              {language === 'SW' ? 'Tunda na mimea ya nyumbani' : language === 'MSH' ? 'Ebitoke n’emishyene' : 'Produits agricoles du Sud-Kivu'}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button 
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/10 flex items-center justify-center text-gray-300 transition"
          >
            <ChevronLeft size={16} />
          </button>
          <button 
            onClick={handleNext}
            disabled={currentIndex === analogyStages.length - 1}
            className="w-8 h-8 rounded-xl bg-white/5 border border-white/5 disabled:opacity-30 disabled:pointer-events-none hover:bg-white/10 flex items-center justify-center text-gray-300 transition"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Current/Selector Indicator */}
      <div className="flex justify-center items-center mb-6 gap-2">
        {analogyStages.map((stage) => {
          const isSelected = stage.id === activeStageId;
          const isTrueCurrent = weeksPregnant >= stage.minWeek && weeksPregnant <= stage.maxWeek;
          return (
            <button
              key={stage.id}
              onClick={() => setActiveStageId(stage.id)}
              className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all flex items-center gap-1 ${
                isSelected 
                  ? 'bg-emerald-500 text-gray-900 shadow-lg border border-emerald-400' 
                  : isTrueCurrent 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'
              }`}
            >
              <span>{stage.emoji}</span>
              <span>S{stage.minWeek}-{stage.maxWeek}</span>
            </button>
          );
        })}
      </div>

      {/* Big Card Content */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeStageId}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10"
        >
          {/* Left Column: Big Symbol Drawing or Avatar */}
          <div className="md:col-span-4 flex justify-center">
            <div className={`relative w-28 h-28 md:w-32 md:h-32 rounded-[2rem] bg-gradient-to-tr ${selectedStage.gradient} border border-white/10 flex flex-col items-center justify-center shadow-lg`}>
              <span className="text-6xl md:text-7xl select-none filter drop-shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
                {selectedStage.emoji}
              </span>
              
              {selectedIsCurrent && (
                <div className="absolute -top-2.5 -right-2.5 bg-brand-primary text-gray-950 text-[8px] font-black uppercase px-2.5 py-1 rounded-full border border-gray-950 flex items-center gap-1 animate-pulse shadow">
                  <Award size={10} /> {language === 'SW' ? 'Sasa' : language === 'MSH' ? 'Buno' : 'Actuel'}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Descriptions and Metrics */}
          <div className="md:col-span-8 space-y-4">
            <div>
              <span className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">
                Semaines {selectedStage.minWeek} à {selectedStage.maxWeek}
              </span>
              <h4 className="text-lg md:text-xl font-black text-white leading-tight mt-0.5 border-none">
                {tLocal.name}
              </h4>
            </div>

            <p className="text-[11px] leading-relaxed text-gray-300 font-medium italic opacity-95">
              {tLocal.description}
            </p>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider block">Longueur (Tête-Siège)</span>
                <span className="text-md font-black text-white">~{selectedStage.lengthCm} cm</span>
              </div>
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 text-center">
                <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider block">Poids estimé</span>
                <span className="text-md font-black text-white">
                  {selectedStage.weightG >= 1000 
                    ? `~${(selectedStage.weightG / 1000).toFixed(2)} kg` 
                    : `~${selectedStage.weightG} g`}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* South-Kivu Agriculture Medical/Nutrition Tip */}
      <div className="mt-6 p-4 rounded-3xl bg-emerald-500/5 border border-emerald-500/10 flex gap-3 relative z-10 items-start">
        <Sparkles className="text-emerald-400 shrink-0 mt-0.5" size={16} />
        <div>
          <span className="text-[8px] font-black uppercase text-emerald-400 tracking-wider block">Conseil Nutrition & Force</span>
          <p className="text-[10px] text-gray-300 italic font-medium leading-relaxed mt-0.5">
            {tLocal.nutritionTip}
          </p>
        </div>
      </div>

      {/* Childbirth Kivu Cultural Trivia */}
      <div className="mt-4 pt-4 border-t border-white/5 relative z-10">
        <span className="text-[8px] font-black uppercase text-gray-500 tracking-wide block mb-1 flex items-center gap-1">
          <Info size={11} className="text-gray-500" /> {trivia.title}
        </span>
        <p className="text-[10px] text-gray-400 leading-relaxed italic">
          {trivia.insight}
        </p>
      </div>
    </div>
  );
}
