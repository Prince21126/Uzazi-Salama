import { EducationalContent, Hospital } from './types';

export const HOSPITALS: Hospital[] = [
  {
    id: 'h1',
    name: 'Hôpital Provincial de Bukavu',
    location: 'Bukavu, Sud-Kivu',
    phone: '+243 812 345 678',
    emergencyContact: '+243 812 000 111',
  },
  {
    id: 'h2',
    name: 'Hôpital de Panzi',
    location: 'Ibanda, Bukavu',
    phone: '+243 821 987 654',
    emergencyContact: '+243 821 000 222',
  },
  {
    id: 'h3',
    name: 'Centre de Santé de Ciriri',
    location: 'Ciriri, Bukavu',
    phone: '+243 855 123 456',
    emergencyContact: '+243 855 000 333',
  },
];

export const EDUCATION_ARTICLES: EducationalContent[] = [
  {
    id: '1',
    category: 'nutrition',
    trimester: 1,
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800', // Salad/Greens
    translations: {
      FR: { title: 'Acide Folique et Sombé', content: 'Mangez du Sombé (feuilles de manioc). C\'est riche en fer et en acide folique, ce qui aide le cerveau de bébé à bien grandir.' },
      SW: { title: 'Asidi Foliki na Sombe', content: 'Kula Sombe (majani ya mihogo). Ina madini ya chuma na asidi foliki inayosaidia ubongo wa mtoto kukua vizuri.' },
      MSH: { title: 'Okulya Sombe', content: 'Orye Sombe kwinji. Kuli kunciza obuzine b’omwana omu nda.' }
    }
  },
  {
    id: '2',
    category: 'nutrition',
    trimester: 2,
    imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800', // Fish
    translations: {
      FR: { title: 'Le Calcium des Sambaza', content: 'Les petits poissons du Lac Kivu sont parfaits pour fortifier les os de bébé. Mangez-en souvent avec votre Bugali.' },
      SW: { title: 'Kalsiamu ya Sambaza', content: 'Samaki wadogo wa Ziwa Kivu ni wazuri kwa kuimarisha mifupa ya mtoto. Kula mara kwa mara na Bugali.' },
      MSH: { title: 'Okulya Sambaza', content: 'Ebisimba by’omu nyanja bili kunciza emishi y’omwana wawe.' }
    }
  },
  {
    id: '3',
    category: 'warning_signs',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=800', // Medical stethoscope/clinic
    translations: {
      FR: { title: 'Gros maux de tête', content: 'Si vous avez mal à la tête très fort et que votre vue devient bizarre, allez vite à l\'hôpital. C\'est peut-être la tension.' },
      SW: { title: 'Maumivu makali ya kichwa', content: 'Ukisikia kichwa kinauma sana na uonaji unakuwa wa ajabu, nenda hospitali haraka. Inaweza kuwa presha.' },
      MSH: { title: 'Obushigo omu murhwi', content: 'Akaba omurhwi guli kukuha bwinji, oye’rhende omu balasho (hospital) haraka.' }
    }
  },
  {
    id: '4',
    category: 'exercise',
    trimester: 2,
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-2969c6a2c7a7?auto=format&fit=crop&q=80&w=800', // Fitness/walking
    translations: {
      FR: { title: 'Marche matinale', content: 'Marcher 20 minutes le matin aide à réduire les gonflements des pieds et vous donne de la force.' },
      SW: { title: 'Kutembea asubuhi', content: 'Kutembea dakika 20 asubuhi kunasaidia kupunguza kuvimba kwa miguu na kukupa nguvu.' },
      MSH: { title: 'Okugenda asubuhi', content: 'Okugenda budere budere asubuhi kuli kunciza emikono n’ebinshino birhafumbi.' }
    }
  },
  {
    id: '5',
    category: 'baby_growth',
    trimester: 3,
    imageUrl: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=800', // Baby hands/caring
    translations: {
      FR: { title: 'Bébé vous entend', content: 'À ce stade, bébé reconnaît votre voix. Parlez-lui ou chantez-lui des chansons douces pour le rassurer.' },
      SW: { title: 'Mtoto anakusikia', content: 'Kufikia sasa, mtoto anatambua sauti yako. Ongea naye au muimbie nyimbo laini ili kumtuliza.' },
      MSH: { title: 'Omwana ali kuku’yumva', content: 'Omwana wawe ali kuku’yumva. Obe n’oyiganira naye lyo amanya izu lyawe.' }
    }
  },
  {
    id: '6',
    category: 'hygiene',
    imageUrl: 'https://images.unsplash.com/photo-1547448415-e9f5b28e570d?auto=format&fit=crop&q=80&w=800', // Hands/cleaning
    translations: {
      FR: { title: 'Dents et Gencives', content: 'La grossesse fragilise les gencives. Brossez-vous les dents doucement pour éviter les petites infections.' },
      SW: { title: 'Meno na Fizi', content: 'Ujauzito unadhoofisha fizi. Piga mswaki kwa upole ili kuepuka maambukizi madogo.' },
      MSH: { title: 'Okuhya meno', content: 'Omubyere ashangirhe ahye meno bwinji na budere budere kunciza amagala gawe.' }
    }
  },
  {
    id: '7',
    category: 'nutrition',
    trimester: 3,
    imageUrl: 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?auto=format&fit=crop&q=80&w=800', // Fruit
    translations: {
      FR: { title: 'Fruits et Vitamines', content: 'Papaye, mangue et bananes de chez nous vous donnent de l\'énergie pour préparer l\'accouchement.' },
      SW: { title: 'Matunda na Vitamini', content: 'Papai, mango na ndizi za hapa kwetu hukupa nguvu ya kujiandaa na kujifungua.' },
      MSH: { title: 'Okulya ebijuma', content: 'Orye ebijuma bwinji lyo obona emisi omu kasanzi k’okubyala.' }
    }
  },
  {
    id: '8',
    category: 'mental_health',
    imageUrl: 'https://images.unsplash.com/photo-1499209974431-9dac3adaf471?auto=format&fit=crop&q=80&w=800', // Calm nature
    translations: {
      FR: { title: 'Repos et Calme', content: 'Si vous vous sentez fatiguée ou triste, parlez à une amie ou à votre maman. Le moral compte beaucoup.' },
      SW: { title: 'Pumzika na Utulie', content: 'Ukihisi umechoka au una huzuni, ongea na rafiki au mama yako. Hali yako ya moyo ni muhimu.' },
      MSH: { title: 'Okuhumana bwinji', content: 'Ocungule omoyo gwawe. Akaba waluha, obe n’oyiganira n’abira bawe.' }
    }
  },
  {
    id: '9',
    category: 'nutrition',
    imageUrl: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800', // Beans/healthy food
    translations: {
      FR: { title: 'Les Haricots (Maranas)', content: 'Riches en fibres, les haricots aident à éviter la constipation qui est fréquente pendant la grossesse.' },
      SW: { title: 'Maharage (Maranas)', content: 'Yakiwa na nyuzi nyingi, maharage husaidia kuepuka kufunga choo ambako ni kawaida wakati wa ujauzito.' },
      MSH: { title: 'Okulya Maranas', content: 'Okulya Maranas kuli kunciza okuhola omu nda.' }
    }
  },
  {
    id: '10',
    category: 'nutrition',
    trimester: 1,
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
    translations: {
      FR: { title: 'Évitez le sel excessif', content: 'Trop de sel peut faire monter votre tension. Préférez les épices naturelles pour donner du goût.' },
      SW: { title: 'Epuka chumvi nyingi', content: 'Chumvi nyingi inaweza kupandisha presha yako. Tumia viungo asilia kwa ladha.' },
      MSH: { title: 'Okufisa omwinyu', content: 'Orhalye omwinyu gwinji lyo emisi y’omwinyu erhazimbaga.' }
    }
  },
  {
    id: '11',
    category: 'warning_signs',
    imageUrl: 'https://images.unsplash.com/photo-1579154235828-401982c60b14?auto=format&fit=crop&q=80&w=800',
    translations: {
      FR: { title: 'Saignements', content: 'Même si c\'est juste un peu, un saignement n\'est pas normal. Allez voir un infirmier tout de suite.' },
      SW: { title: 'Kutoka damu', content: 'Hata kama ni kidogo, kutoka damu sio kawaida. Nenda kumuona nesi mara moja.' },
      MSH: { title: 'Okufuluha danda', content: 'Akaba wafuluha danda obe n’oyirhende omu balasho (hospital) haraka.' }
    }
  },
  {
    id: '12',
    category: 'hygiene',
    imageUrl: 'https://images.unsplash.com/photo-1548839130-ad1f297c6a47?auto=format&fit=crop&q=80&w=800',
    translations: {
      FR: { title: 'Eau potable', content: 'Buvez beaucoup d\'eau bouillie ou filtrée. C\'est important pour renouveler le liquide de bébé.' },
      SW: { title: 'Maji safi ya kunywa', content: 'Kunwa maji mengi yaliyochemshwa au kuchujwa. Ni muhimu kwa ajili ya maji yanayomzunguka mtoto.' },
      MSH: { title: 'Okunywa maji', content: 'Obe n’onywa maji maciye bwinji kunciza amagala g’omwana.' }
    }
  },
  {
    id: '13',
    category: 'exercise',
    trimester: 1,
    imageUrl: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&q=80&w=800',
    translations: {
      FR: { title: 'Bougez doucement', content: 'Au début, ne portez pas de charges trop lourdes. Demandez de l\'aide pour les travaux difficiles au champ ou au marché.' },
      SW: { title: 'Sogea polepole', content: 'Mwanzoni, usibebe mizigo mizito sana. Omba msaada kwa kazi ngumu shambani au sokoni.' },
      MSH: { title: 'Okugendera budere', content: 'Orhabegaga obuzito bwinji lyo orhalomwa omu nda.' }
    }
  },
  {
    id: '14',
    category: 'mental_health',
    trimester: 2,
    imageUrl: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=80&w=800',
    translations: {
      FR: { title: 'Rêver de bébé', content: 'Commencez à imaginer votre vie avec bébé. Cela crée un lien fort avant même la naissance.' },
      SW: { title: 'Waza kuhusu mtoto', content: 'Anza kufikiria maisha yako na mtoto. Hii inatengeneza uhusiano wenye nguvu kabla hata hajazaliwa.' },
      MSH: { title: 'Okuyiga omwana', content: 'Otangire okuyiga n’omwana wawe omu nda lyo amanya okuzimbagira.' }
    }
  },
  {
    id: '15',
    category: 'nutrition',
    trimester: 2,
    imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=800',
    translations: {
      FR: { title: 'L\'Avocat de chez nous', content: 'L\'avocat contient de "bonnes graisses" essentielles pour le développement des yeux et de la peau de bébé.' },
      SW: { title: 'Parachichi la kwetu', content: 'Parachichi lina "mafuta mazuri" muhimu kwa ukuaji wa macho na ngozi ya mtoto.' },
      MSH: { title: 'Okulya maparacichi', content: 'Ebijuma bimanyirwe maparacichi bili kunciza amasu g’omwana wawe.' }
    }
  },
  {
    id: '16',
    category: 'baby_growth',
    trimester: 1,
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71f1e59816?auto=format&fit=crop&q=80&w=800',
    translations: {
      FR: { title: 'Le Coeur bat déjà', content: 'Dès le premier mois, le petit coeur de votre bébé commence à battre. Il est minuscule mais déjà vivant.' },
      SW: { title: 'Moyo unapiga tayari', content: 'Kuanzia mwezi wa kwanza, moyo mdogo wa mtoto wako unaanza kupiga. Ni mdogo sana lakini tayari uko hai.' },
      MSH: { title: 'Omutima guli kunesa', content: 'Omutima g’omwana guli kunesa budere budere omu nda.' }
    }
  },
  {
    id: '17',
    category: 'warning_signs',
    imageUrl: 'https://images.unsplash.com/photo-1584036533827-45bce166ad94?auto=format&fit=crop&q=80&w=800',
    translations: {
      FR: { title: 'Forte Fièvre', content: 'Une fièvre peut être le signe du paludisme. Allez faire un test rapidement, c\'est dangereux pour la grossesse.' },
      SW: { title: 'Homa kali', content: 'Homa inaweza kuwa dalili ya malaria. Nenda kufanya kipimo haraka, ni hatari kwa ujauzito.' },
      MSH: { title: 'Omuliro gwinji', content: 'Akaba omuliro gwinji, obe n’oyirhende emulasho lyo bacungula malaria.' }
    }
  },
  {
    id: '18',
    category: 'nutrition',
    trimester: 3,
    imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
    translations: {
      FR: { title: 'Repas légers et fréquents', content: 'Comme bébé prend de la place, mangez des petites quantités plusieurs fois par jour pour mieux digérer.' },
      SW: { title: 'Milo mipesi na ya mara kwa mara', content: 'Kwa sababu mtoto anachukua nafasi, kula kiasi kidogo mara kadhaa kwa siku ili kusaga chakula vizuri.' },
      MSH: { title: 'Okulya budere', content: 'Orye budere budere bwinji omu kasanzi lyo omwana akula budere omu nda.' }
    }
  },
  {
    id: '19',
    category: 'exercise',
    trimester: 3,
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-2969c6a2c7a7?auto=format&fit=crop&q=80&w=800',
    translations: {
      FR: { title: 'Bascule du bassin', content: 'Faites des mouvements doux avec votre bassin pour aider bébé à se mettre dans la bonne position pour sortir.' },
      SW: { title: 'Kutingisha nyonga', content: 'Fanya miondoko laini na nyonga yako ili kumsaidia mtoto kukaa kwenye nafasi nzuri ya kutoa.' },
      MSH: { title: 'Okugendera omwansi', content: 'Okugendera omwansi kuli kunciza omwana oku’rhenga budere omu nda.' }
    }
  },
  {
    id: '20',
    category: 'hygiene',
    imageUrl: 'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&q=80&w=800',
    translations: {
      FR: { title: 'Vêtements amples', content: 'Portez des habits en coton qui ne serrent pas le ventre. Vous vous sentirez beaucoup plus à l\'aise.' },
      SW: { title: 'Nguo pana', content: 'Vaa nguo za pamba ambazo hazibani tumbo. Utahisi vizuri zaidi.' },
      MSH: { title: 'Okuhishira minyere', content: 'Oyishishe eminyere emidire lyo orhafambirwa omu nda.' }
    }
  },
];
