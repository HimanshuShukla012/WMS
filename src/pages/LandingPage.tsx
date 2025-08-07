import Navbar from "../components/Navbar"; // adjust the path if it's in a different folder
import Footer from "../components/Footer";
import { Map, Layers, Building2, PhoneCall,
  Send,
  Wrench,
  CheckCircle2,
  UserCheck,
  Archive, } from "lucide-react";


const stages = [
  {
    title: "चरण 1",
    desc: "लाभार्थी द्वारा कॉल सेंटर या निकटतम ग्राम पंचायत सचिवालय जाकर शिकायत दर्ज करना।",
    icon: <PhoneCall size={28} />,
    colorFrom: "from-indigo-500",
    colorTo: "to-purple-600",
  },
  {
    title: "चरण 2",
    desc: "शिकायत जल निगम को अग्रसारित करना।",
    icon: <Send size={28} />,
    colorFrom: "from-blue-500",
    colorTo: "to-cyan-500",
  },
  {
    title: "चरण 3",
    desc: "जल निगम द्वारा शिकायत निराकरण के उपरांत पोर्टल पर अपडेट करना।",
    icon: <Wrench size={28} />,
    colorFrom: "from-green-500",
    colorTo: "to-emerald-500",
  },
  {
    title: "चरण 4",
    desc: "ग्राम पंचायत द्वारा पूर्ण किए गए कार्य की पुष्टि किया जाना।",
    icon: <CheckCircle2 size={28} />,
    colorFrom: "from-yellow-500",
    colorTo: "to-orange-500",
  },
  {
    title: "चरण 5",
    desc: "कॉल सेंटर द्वारा लाभार्थी से कार्य समापन की पुष्टि करना।",
    icon: <UserCheck size={28} />,
    colorFrom: "from-pink-500",
    colorTo: "to-rose-500",
  },
  {
    title: "चरण 6",
    desc: "अंततः कॉल सेंटर द्वारा शिकायत की स्थिति को 'बंद' के रूप में चिह्नित करना।",
    icon: <Archive size={28} />,
    colorFrom: "from-slate-500",
    colorTo: "to-gray-600",
  },
];

const dignitaries = [
  {
    name: "माननीय मुख्यमंत्री उ०प्र०",
    designation: "योगी आदित्यनाथ",
    image: "CM-Yogi.png",
  },
  {
    name: "माननीय मंत्री पंचायती राज विभाग",
    designation: "श्री ओम प्रकाश राजभर",
    image: "Minister-PRD.png",
  },
  {
    name: "प्रमुख सचिव पंचायती राज विभाग",
    designation: "श्री अनिल कुमार (आई०ए०एस०)",
    image: "ps.png",
  },
  {
    name: "निदेशक पंचायती राज, उत्तर प्रदेश",
    designation: "श्री अमित कुमार सिंह (आई०ए०एस०)",
    image: "director.png",
  },
];

const stats = [
  {
    label: "जनपद (Districts)",
    value: "75",
    description: "उत्तर प्रदेश के सभी जिलों में कार्य का विस्तार",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-3.866-1.343-7-3-7s-3 3.134-3 7c0 3.866 1.343 7 3 7s3-3.134 3-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21H3" />
      </svg>
    ),
  },
  {
    label: "ब्लॉक पंचायतें",
    value: "826",
    description: "प्रत्येक ब्लॉक में जल प्रबंधन की निगरानी",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M9 21V3m6 18V3" />
      </svg>
    ),
  },
  {
    label: "ग्राम पंचायतें",
    value: "57,695",
    description: "हर पंचायत तक पानी पहुंचाने का लक्ष्य",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    label: "राजस्व ग्राम",
    value: "1,08,935",
    description: "सभी राजस्व ग्रामों में प्रस्तावित जल सेवा की उपलब्धता",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" />
      </svg>
    ),
  },
];


const LandingPage = () => {
  return (
    <div className="text-white bg-[#0c1f33] font-sans scroll-smooth">
        <Navbar />
      {/* Hero Section */}
      <div className="relative h-screen w-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-50"
        >
          <source src="Hero.mp4" type="video/mp4" />
        </video>


        
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight drop-shadow-xl">
            एकीकृत जल प्रबंधन प्रणाली (IWMS)
          </h1>
          <p className="text-xl md:text-2xl mt-4 max-w-2xl text-gray-200 drop-shadow-lg">
            उत्तर प्रदेश की ग्रामीण जल आपूर्ति कार्य की निगरानी हेतु डिजिटल समाधान
          </p>
        </div>
      </div>

      {/* Dignitaries */}
<section className="py-20 text-center bg-gradient-to-br from-[#0a2540] via-[#103c63] to-[#144e77]">
        <h2 className="text-4xl font-bold mb-16 text-white tracking-wide">
          सम्माननीय जनप्रतिनिधि
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 px-8 md:px-20">
          {dignitaries.map((person, idx) => (
            <div
              key={idx}
              className="bg-white bg-opacity-5 rounded-2xl p-6 backdrop-blur-md shadow-xl hover:scale-105 transition-all"
            >
              <img
                src={person.image}
                alt={person.name}
                className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-white mb-4 mx-auto shadow-md"
              />
              <h3 className="text-lg font-semibold text-white">{person.name}</h3>
              <p className="text-sm text-blue-200">{person.designation}</p>
            </div>
          ))}
        </div>
      </section>
{/* What is Water Management Project Section */}
<section
  className="bg-white py-24 px-6 md:px-24 text-gray-900 scroll-mt-20"
  id="water-management"
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-stretch">
    {/* Left Column */}
    <div className="flex flex-col leading-tight justify-center">
      <h2 className="text-4xl leading-tight font-extrabold bg-gradient-to-r from-blue-900 to-purple-700 bg-clip-text text-transparent tracking-tight mb-4">
        क्यों ज़रूरी है जल प्रबंधन का यह कार्य?
      </h2>
      <h3 className="text-2xl text-blue-700 font-semibold mb-6">
        ग्रामीण उत्तर प्रदेश में जल आपूर्ति का डिजिटल रूपांतरण
      </h3>
      <p className="text-lg text-gray-900 leading-relaxed">
        जल ही जीवन है — और इसी जीवन को संरक्षित व सुव्यवस्थित करने हेतु पंचायती राज विभाग उत्तर प्रदेश ने 
        एकीकृत जल प्रबंधन प्रणाली (IWMS) की शुरुआत की है। यह कार्य केवल पाइपलाइन और 
        पंप हाउस तक सीमित नहीं है; यह एक डिजिटल प्लेटफ़ॉर्म है जो ग्राम पंचायत स्तर पर जल 
        आपूर्ति की हर प्रक्रिया को सशक्त, पारदर्शी और उत्तरदायी बनाता है। <br /><br />
        प्रणाली रियल टाइम मॉनिटरिंग, नागरिक शिकायत निवारण, जल कर संग्रहण, पंप संचालन और 
        रिपोर्टिंग जैसे प्रमुख पहलुओं को एकीकृत करती है। इससे न केवल प्रशासनिक दक्षता बढ़ती है, 
        बल्कि नागरिकों को निर्बाध और समय पर जल सेवा प्राप्त होती है। यह कार्य उत्तर प्रदेश के ग्रामीण क्षेत्रों की बुनियादी ज़रूरतों को तकनीक से जोड़ते हुए जल प्रबंधन के भविष्य की नींव रखती है।
      </p>
    </div>

    {/* Right Column - Full Height Image Bento Card */}
    <div className="flex h-full">
      <div className="bg-white/10 rounded-3xl backdrop-blur-xl shadow-xl border border-gray-300/20 p-4 w-full flex items-center justify-center hover:scale-105 transition-transform duration-300">
        <img
          src="/public/pipeline.png"
          alt="Water Management Illustration"
          className="rounded-2xl object-cover w-full h-full max-h-[500px]"
        />
      </div>
    </div>
  </div>
</section>
      <section className="relative py-28 bg-[#0a0f1c] overflow-hidden text-white">
  <div className="absolute inset-0 z-0 bg-[url('/wallpaper.png')] bg-cover opacity-50"></div>

  <h2 className="text-5xl leading-tight font-extrabold text-center mb-20 z-10 relative text-blue-200">
    <span className="inline-block bg-clip-text text-white">
      सांख्यिकीय अवलोकन
    </span>
  </h2>

  <div className="relative z-10 flex flex-wrap justify-center gap-10 px-6 md:px-16">
    {stats.map((stat, idx) => (
      <div
        key={idx}
        className="w-64 bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] text-white p-6 rounded-3xl shadow-lg hover:scale-105 transition-transform"
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className="bg-white/20 p-3 rounded-full">
            {/* Replace below SVGs with any Lucide/Heroicon or your own */}
            {stat.icon}
          </div>
          <div>
            <h3 className="text-3xl font-bold">{stat.value}</h3>
            <p className="text-sm opacity-80">{stat.label}</p>
          </div>
        </div>
        <p className="text-sm opacity-90">{stat.description}</p>
      </div>
    ))}
  </div>
</section>


      {/* Project Objective - Bento Style */}
<section className="bg-white py-24 px-6 md:px-24 text-gray-900">
  <h2 className="text-4xl font-extrabold text-center mb-16 tracking-tight text-gray-900">
    कार्य का उद्देश्य
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {/* Card 1 */}
    <div className="bg-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white mb-4">
        <Map size={20} />
      </div>
      <h3 className="text-xl font-semibold mb-2">जल आपूर्ति की सुव्यवस्थित निगरानी </h3>
      <p className="text-gray-700 text-base leading-relaxed">
        ग्रामीण क्षेत्रों में जल की आपूर्ति को सुचारु व तकनीकी रूप से सक्षम बनाना।
      </p>
    </div>

    {/* Card 2 */}
    <div className="bg-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-600 text-white mb-4">
        <Building2 size={20} />
      </div>
      <h3 className="text-xl font-semibold mb-2">शिकायत निवारण प्रबंधन </h3>
      <p className="text-gray-700 text-base leading-relaxed">
        नागरिकों की शिकायतों का त्वरित समाधान एक प्लेटफ़ॉर्म पर।
      </p>
    </div>

    {/* Card 3 */}
    <div className="bg-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-600 text-white mb-4">
        <Layers size={20} />
      </div>
      <h3 className="text-xl font-semibold mb-2">जल कर संग्रहण</h3>
      <p className="text-gray-700 text-base leading-relaxed">
        पारदर्शी और कुशल रूप से जल कर का संग्रहण।
      </p>
    </div>

    {/* Card 4 */}
    <div className="bg-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-600 text-white mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 00-4-4H5a4 4 0 000 8h4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7h4a4 4 0 010 8h-1a4 4 0 00-4-4v-2a4 4 0 014-4z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2">वाटर सप्लाई रोस्टर एवं पंप संचालन की निगरानी</h3>
      <p className="text-gray-700 text-base leading-relaxed">
        जलापूर्ति का रोस्टर तैयार कर पंप हाउस संचालन की वास्तविक समय में निगरानी।
      </p>
    </div>

    {/* Card 5 */}
    <div className="bg-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-pink-600 text-white mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m4 0h2m-2 0v-2a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m-4 0H5m4 0v-2a2 2 0 00-2-2H3a2 2 0 00-2 2v2" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2">रियल टाइम MIS रिपोर्टिंग</h3>
      <p className="text-gray-700 text-base leading-relaxed">
        रिपोर्टिंग और डैशबोर्ड के माध्यम से निगरानी और मूल्यांकन।
      </p>
    </div>

    {/* Card 6 */}
    <div className="bg-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-red-600 text-white mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4h16v16H4z" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2">VWSC का सशक्तिकरण</h3>
      <p className="text-gray-700 text-base leading-relaxed">
        VWSC के माध्यम से जलापूर्ति योजनायों का सुचारू रूप से रख-रखाव का कार्य।
      </p>
    </div>
  </div>
</section>


 <section className="relative py-48 px-6 md:px-24 bg-[#0b1729] overflow-hidden text-white">
  <div className="absolute inset-0 z-0 bg-[url('/2.png')] bg-cover bg-center opacity-30"></div>

  <div className="relative z-10 text-center mb-20">
    <h2 className="text-5xl font-extrabold mb-6 tracking-tight text-white drop-shadow-xl">
      शिकायत दर्ज करने की प्रक्रिया
    </h2>
    <p className="text-lg text-blue-100 max-w-3xl mx-auto font-medium">
      जल संबंधित समस्याओं के समाधान हेतु पारदर्शी और चरणबद्ध प्रक्रिया
    </p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 z-10 w-full">
    {stages.map((stage, idx) => (
      <div
        key={idx}
        className={`relative group rounded-2xl p-5 text-white transition-all duration-300 shadow-2xl hover:scale-105 bg-gradient-to-br ${stage.colorFrom} ${stage.colorTo}`}
      >
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
          <div className="w-10 h-10 bg-white text-blue-900 font-bold rounded-full shadow-md flex items-center justify-center ring-2 ring-white/40">
            {idx + 1}
          </div>
        </div>

        <div className="mb-4 mt-6 flex justify-center">{stage.icon}</div>

        <h4 className="text-lg font-bold text-center mb-2">{stage.title}</h4>

        <p className="text-sm text-white/90 text-center leading-snug">
          {stage.desc}
        </p>

        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none ring-2 ring-white/20 ring-offset-2"></div>
      </div>
    ))}
  </div>
</section>
<Footer />
    </div>
  );
};

export default LandingPage;
