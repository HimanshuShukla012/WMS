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
    title: "Stage 1",
    desc: "Beneficiary registers complaint by calling the call center or visiting the nearest gram panchayat secretariat.",
    icon: <PhoneCall size={28} />,
    colorFrom: "from-indigo-500",
    colorTo: "to-purple-600",
  },
  {
    title: "Stage 2",
    desc: "Complaint is forwarded to the water corporation.",
    icon: <Send size={28} />,
    colorFrom: "from-blue-500",
    colorTo: "to-cyan-500",
  },
  {
    title: "Stage 3",
    desc: "Water corporation updates the portal after resolving the complaint.",
    icon: <Wrench size={28} />,
    colorFrom: "from-green-500",
    colorTo: "to-emerald-500",
  },
  {
    title: "Stage 4",
    desc: "Gram panchayat confirms the completion of the work done.",
    icon: <CheckCircle2 size={28} />,
    colorFrom: "from-yellow-500",
    colorTo: "to-orange-500",
  },
  {
    title: "Stage 5",
    desc: "Call center confirms work completion with the beneficiary.",
    icon: <UserCheck size={28} />,
    colorFrom: "from-pink-500",
    colorTo: "to-rose-500",
  },
  {
    title: "Stage 6",
    desc: "Finally, call center marks the complaint status as 'closed'.",
    icon: <Archive size={28} />,
    colorFrom: "from-slate-500",
    colorTo: "to-gray-600",
  },
];

const dignitaries = [
  {
    name: "Honorable Chief Minister U.P.",
    designation: "Yogi Adityanath",
    image: "CM-Yogi.png",
  },
  {
    name: "Honorable Minister Panchayati Raj U.P.",
    designation: "Shri Om Prakash Rajbhar",
    image: "Minister-PRD.png",
  },
  {
    name: "Principal Secretary Panchayati Raj U.P.",
    designation: "Shri Anil Kumar (I.A.S.)",
    image: "ps.png",
  },
  {
    name: "Director Panchayati Raj U.P.",
    designation: "Shri Amit Kumar Singh (I.A.S.)",
    image: "director.png",
  },
  
];

const stats = [
  {
    label: "Districts",
    value: "75",
    description: "Work expansion across all districts of Uttar Pradesh",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-3.866-1.343-7-3-7s-3 3.134-3 7c0 3.866 1.343 7 3 7s3-3.134 3-7z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21H3" />
      </svg>
    ),
  },
  {
    label: "Block Panchayats",
    value: "826",
    description: "Water management monitoring in every block",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M9 21V3m6 18V3" />
      </svg>
    ),
  },
  {
    label: "Gram Panchayats",
    value: "57,695",
    description: "Goal to deliver water to every panchayat",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    label: "Revenue Villages",
    value: "1,08,935",
    description: "Proposed water service availability in all revenue villages",
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
             Water Management System (WMS)
          </h1>
          <p className="text-xl md:text-2xl mt-4 max-w-2xl text-gray-200 drop-shadow-lg">
            Digital solution for monitoring rural water supply operations in Uttar Pradesh
          </p>
        </div>
      </div>

      {/* Dignitaries */}
<section className="py-20 text-center bg-gradient-to-br from-[#0a2540] via-[#103c63] to-[#144e77]">
        <h2 className="text-4xl font-bold mb-16 text-white tracking-wide">
          Honorable Representatives
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
        Why is this Water Management Project Essential?
      </h2>
      <h3 className="text-2xl text-blue-700 font-semibold mb-6">
        Digital Transformation of Water Supply in Rural Uttar Pradesh
      </h3>
      <p className="text-lg text-gray-900 leading-relaxed">
        Water is life — and to preserve and organize this life, the Panchayati Raj Department of Uttar Pradesh has launched 
        the Water Management System (WMS). This initiative is not limited to pipelines and 
        pump houses; it is a digital platform that makes every water supply process at the gram panchayat level 
        empowered, transparent, and accountable. <br /><br />
        The system integrates key aspects such as real-time monitoring, citizen complaint resolution, water tax collection, pump operation, and 
        reporting. This not only increases administrative efficiency, 
        but also provides citizens with seamless and timely water services. This project lays the foundation for the future of water management by connecting the basic needs of rural areas of Uttar Pradesh with technology.
      </p>
    </div>

    {/* Right Column - Full Height Image Bento Card */}
    <div className="flex h-full">
      <div className="bg-white/10 rounded-3xl backdrop-blur-xl shadow-xl border border-gray-300/20 p-4 w-full flex items-center justify-center hover:scale-105 transition-transform duration-300">
        <img
          src="/pipeline.png"
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
      Statistical Overview
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
    Project Objectives
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {/* Card 1 */}
    <div className="bg-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-blue-600 text-white mb-4">
        <Map size={20} />
      </div>
      <h3 className="text-xl font-semibold mb-2">Systematic Water Supply Monitoring</h3>
      <p className="text-gray-700 text-base leading-relaxed">
        Making water supply in rural areas smooth and technically efficient.
      </p>
    </div>

    {/* Card 2 */}
    <div className="bg-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-600 text-white mb-4">
        <Building2 size={20} />
      </div>
      <h3 className="text-xl font-semibold mb-2">Complaint Resolution Management</h3>
      <p className="text-gray-700 text-base leading-relaxed">
        Quick resolution of citizens' complaints on one platform.
      </p>
    </div>

    {/* Card 3 */}
    <div className="bg-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-green-600 text-white mb-4">
        <Layers size={20} />
      </div>
      <h3 className="text-xl font-semibold mb-2">Water Tax Collection</h3>
      <p className="text-gray-700 text-base leading-relaxed">
        Transparent and efficient water tax collection.
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
      <h3 className="text-xl font-semibold mb-2">Water Supply Roster & Pump Operation Monitoring</h3>
      <p className="text-gray-700 text-base leading-relaxed">
        Preparing water supply rosters and real-time monitoring of pump house operations.
      </p>
    </div>

    {/* Card 5 */}
    <div className="bg-gray-100 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all">
      <div className="w-12 h-12 flex items-center justify-center rounded-full bg-pink-600 text-white mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m4 0h2m-2 0v-2a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m-4 0H5m4 0v-2a2 2 0 00-2-2H3a2 2 0 00-2 2v2" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2">Real-Time MIS Reporting</h3>
      <p className="text-gray-700 text-base leading-relaxed">
        Monitoring and evaluation through reporting and dashboard.
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
      <h3 className="text-xl font-semibold mb-2">VWSC Empowerment</h3>
      <p className="text-gray-700 text-base leading-relaxed">
        Smooth maintenance of water supply schemes through VWSC.
      </p>
    </div>
  </div>
</section>


 <section className="relative py-48 px-6 md:px-24 bg-[#0b1729] overflow-hidden text-white">
  <div className="absolute inset-0 z-0 bg-[url('/2.png')] bg-cover bg-center opacity-30"></div>

  <div className="relative z-10 text-center mb-20">
    <h2 className="text-5xl font-extrabold mb-6 tracking-tight text-white drop-shadow-xl">
      Complaint Registration Process
    </h2>
    <p className="text-lg text-blue-100 max-w-3xl mx-auto font-medium">
      Transparent and step-by-step process for resolving water-related problems
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
{/* Handover Takeover Section */}
<section className="bg-white py-24 px-6 md:px-24 text-gray-900">
  <div className="max-w-7xl mx-auto">
    <div className="text-center mb-16">
      <h2 className="text-4xl font-extrabold mb-6 tracking-tight text-gray-900">
        Handover Takeover
      </h2>
      <p className="text-xl text-gray-600 font-medium">
        Of Rural Water Supply Schemes
      </p>
      
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      {/* Left Column - Content */}
      <div className="space-y-8">
        {/* Relevant G.O Section */}
        <div className="bg-gray-50 p-6 rounded-2xl shadow-sm">
          <h3 className="text-2xl font-bold mb-4 text-gray-900">Relevant G.O Numbers:</h3>
          <ul className="space-y-2 text-gray-700">
            <li>a) G.O - 814 / पीएसएमएस / 2024, dated: 06 Sep 2024</li>
            <li>b) G.O - 2499/76-1-2023, dated: 28 June 2024</li>
            <li>c) G.O - 1596/33-3-2023- 1028/2022 TC, dated: 08 August 2023</li>
            <li>d) G.O - 365/33-3-2023, dated: 20 Feb 2023</li>
            <li>e) G.O - 1896/33-3-2022-1028/2022 TC, dated 11 Nov 2022</li>
          </ul>
        </div>

        {/* Procedure Section */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-900">PROCEDURE:</h3>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
              <h4 className="font-semibold text-lg mb-2">1. Constitutional Amendment</h4>
              <p className="text-gray-700 leading-relaxed">
                The 73rd Amendment to the Constitution in 1992, added a new Part IX to the Constitution titled 
                'The Panchayats' covering provisions from Article 243 to 243 (O); and a new Eleventh Schedule 
                covering 29 subjects within the functions of the Panchayats'. Entry 11 of this schedule is drinking 
                water, devolving its management to Panchayati Raj Institutions (PRIs).
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-xl border-l-4 border-green-500">
              <h4 className="font-semibold text-lg mb-2">2. State Government Order</h4>
              <p className="text-gray-700 leading-relaxed">
                According to UP State G.O - 814 / पीएसएमएस / 2024 dated: 06 Sep 2024, the State finance 
                commission and Central finance commission funds will be utilised for the O&M of only those 
                schemes handed over to Gram Panchayat through the handover takeover management portal 
                (www.rwsp.upprd.in). Moreover, there is a provision for water user charge collection.
              </p>
            </div>

            <div className="bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-500">
              <h4 className="font-semibold text-lg mb-2">3. Two Stage Process</h4>
              <p className="text-gray-700 leading-relaxed mb-4">
                There are two stages involved in handover takeover procedure, viz. Stage 1st and 2nd.
              </p>
              <div className="ml-4 space-y-3">
                <div>
                  <h5 className="font-semibold text-gray-800">3.1. Stage 1st</h5>
                  <p className="text-gray-700">
                    Comprises 07 different annexures covering a) basic details, b) DPR, c) Hydro-testing report, 
                    d) As built Drawing, e) Trail and Run certificate, f) Water supply timing, g) Road restoration, 
                    H) land verification, I) beneficiary details etc.
                  </p>
                  <p className="text-sm font-medium text-gray-600 mt-2">• TECHNICAL VERIFICATION BY DIRECTORATE</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-500">
              <h4 className="font-semibold text-lg mb-2">4. Stage 2nd</h4>
              <p className="text-gray-700 leading-relaxed">
                Consists of a join site visit by the officials of Gramin Jalapurti Prakoshth / Consulting Engineer, 
                along with ADO (P), Panchayat Sachiv, Gram Pradhan, and JE (UPJN-G) within a reasonable time frame. 
                Based on the field visit report, the scheme is approved/reverted online by the concerned ADO (P) and DPRO. 
                Projects where major technical issues rise, those are reverted to the concerned UP JN section for further 
                action, and projects those are found satisfactory, are forwarded to ADO (P) and from ADO(P) to DPRO.
              </p>
            </div>

            <div className="bg-indigo-50 p-6 rounded-xl border-l-4 border-indigo-500">
              <h4 className="font-semibold text-lg mb-2">5. Final Approval</h4>
              <p className="text-gray-700 leading-relaxed">
                Once the scheme is approved by ADO (P) and DPRO, an Online certificate is generated instantly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Process Flow */}
      <div className="lg:sticky lg:top-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-3xl shadow-lg">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">Process Flow</h3>
          <div className="space-y-6">
            {[
              { title: "Project Initiation by UPJN (G)", color: "bg-blue-500" },
              { title: "Technical Verification by Directorate (PRD)", color: "bg-green-500" },
              { title: "Site visit by Engineer (GJP), G.Pradhan, ADO (P), Sachiv (P)", color: "bg-yellow-500" },
              { title: "Online approval by Assistant Development Officer (Panchayat)", color: "bg-purple-500" },
              { title: "Online approval by District Panchayat Raj Officer", color: "bg-indigo-500" },
              { title: "Handover takeover of rural water supply scheme", color: "bg-emerald-500" }
            ].map((step, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`w-8 h-8 ${step.color} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {index + 1}
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm flex-1">
                  <p className="text-gray-800 font-medium text-sm leading-relaxed">{step.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<Footer />
    </div>
  );
};

export default LandingPage;