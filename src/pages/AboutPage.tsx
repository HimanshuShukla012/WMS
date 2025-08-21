import React, { useState, useEffect } from 'react';
import Navbar from "../components/Navbar"; // adjust the path if it's in a different folder
import Footer from "../components/Footer";
import { 
  Droplets, 
  Target, 
  Users, 
  Building2, 
  PhoneCall, 
  Monitor, 
  CheckCircle, 
  Award,
  Map,
  Layers,
  Wrench,
  Send,
  Sparkles,
  ArrowRight,
  Play,
  BarChart3,
  UserCheck,
  Shield,
  Zap,
  Globe,
  Heart,
  Archive,
  CheckCircle2
} from 'lucide-react';

const About = () => {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const objectives = [
    {
      icon: <Map size={24} />,
      title: "Systematic Water Supply Monitoring",
      description: "Making water supply in rural areas smooth and technically efficient through comprehensive monitoring systems.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <PhoneCall size={24} />,
      title: "Transparent Complaint Resolution",
      description: "Comprehensive complaint management system ensuring 6-stage transparent tracking from registration to closure.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Monitor size={24} />,
      title: "Infrastructure Management",
      description: "Monitoring of pump houses, OHT systems, and water distribution networks with proper maintenance scheduling.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <BarChart3 size={24} />,
      title: "MIS Reporting & Analytics",
      description: "Comprehensive dashboards and reporting systems for better decision-making and resource optimization.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Users size={24} />,
      title: "VWSC Digital Support",
      description: "Complete digitization of Village Water and Sanitation Committee operations with user-friendly interfaces.",
      color: "from-teal-500 to-blue-500"
    }
  ];

  const keyFeatures = [
    {
      icon: <Droplets size={32} />,
      title: "Multi-Role Dashboard System",
      description: "Dedicated interfaces for Admin, Gram Panchayat, and Call Center with role-based access control and personalized workflows.",
      gradient: "from-blue-600 via-purple-600 to-indigo-700",
      stats: "3 Role Types"
    },
    {
      icon: <Building2 size={32} />,
      title: "Complete Beneficiary Management",
      description: "End-to-end beneficiary lifecycle management from registration to service delivery with digital documentation.",
      gradient: "from-emerald-500 via-teal-500 to-cyan-600",
      stats: "100% Digital"
    },
    {
      icon: <Target size={32} />,
      title: "Infrastructure Monitoring",
      description: "Comprehensive monitoring of pump houses, overhead tanks, and distribution networks with maintenance tracking.",
      gradient: "from-orange-500 via-red-500 to-pink-600",
      stats: "24/7 Support"
    },
    {
      icon: <Shield size={32} />,
      title: "Water Quality Management",
      description: "Comprehensive water quality testing, reporting, and compliance management with systematic alerts.",
      gradient: "from-violet-500 via-purple-500 to-fuchsia-600",
      stats: "Quality First"
    }
  ];

  const stats = [
    { 
      label: "Districts", 
      value: "75", 
      description: "Complete coverage across Uttar Pradesh",
      icon: <Globe size={20} />,
      color: "from-blue-500 to-cyan-500"
    },
    { 
      label: "Block Panchayats", 
      value: "826", 
      description: "Every block connected digitally",
      icon: <Building2 size={20} />,
      color: "from-purple-500 to-pink-500"
    },
    { 
      label: "Gram Panchayats", 
      value: "57,695", 
      description: "Rural communities empowered",
      icon: <Users size={20} />,
      color: "from-green-500 to-emerald-500"
    },
    { 
      label: "Revenue Villages", 
      value: "1,08,935", 
      description: "Universal water service vision",
      icon: <Heart size={20} />,
      color: "from-orange-500 to-red-500"
    }
  ];

  const workflowStages = [
    {
      stage: "Stage 1",
      icon: <PhoneCall size={28} />,
      title: "Complaint Registration",
      description: "Beneficiary registers complaint by calling the call center or visiting the nearest gram panchayat secretariat.",
      color: "from-indigo-500 to-purple-600",
      features: ["Call Center", "GP Secretariat", "Direct Visit"]
    },
    {
      stage: "Stage 2",
      icon: <Send size={28} />,
      title: "Forwarding to Corporation",
      description: "Complaint is forwarded to the water corporation.",
      color: "from-blue-500 to-cyan-500",
      features: ["Auto-Forward", "Priority Assignment", "Tracking ID"]
    },
    {
      stage: "Stage 3",
      icon: <Wrench size={28} />,
      title: "Resolution & Update",
      description: "Water corporation updates the portal after resolving the complaint.",
      color: "from-green-500 to-emerald-500",
      features: ["Field Work", "Status Update", "Documentation"]
    },
    {
      stage: "Stage 4",
      icon: <CheckCircle2 size={28} />,
      title: "GP Confirmation",
      description: "Gram panchayat confirms the completion of the work done.",
      color: "from-yellow-500 to-orange-500",
      features: ["Work Verification", "GP Approval", "Quality Check"]
    },
    {
      stage: "Stage 5",
      icon: <UserCheck size={28} />,
      title: "Beneficiary Confirmation",
      description: "Call center confirms work completion with the beneficiary.",
      color: "from-pink-500 to-rose-500",
      features: ["Call Verification", "Satisfaction Check", "Final Approval"]
    },
    {
      stage: "Stage 6",
      icon: <Archive size={28} />,
      title: "Complaint Closure",
      description: "Finally, call center marks the complaint status as 'closed'.",
      color: "from-slate-500 to-gray-600",
      features: ["Final Status", "Case Closure", "Record Archive"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 overflow-hidden">
        <Navbar/>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 text-white py-24 px-6">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            About Water Management System
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            A comprehensive digital solution for monitoring and managing rural water supply operations 
            across Uttar Pradesh, ensuring transparent and efficient water services for all.
          </p>
        </div>
      </div>
      
      {/* Interactive Mission Statement */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-8">
              <Zap size={20} className="text-blue-600" />
              <span className="font-semibold text-blue-800">Our Mission</span>
            </div>
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              Digital Transformation of
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Water Ecosystem
              </span>
            </h2>
          </div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl p-12 border border-gray-100 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="flex items-start space-x-6 mb-8">
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <Droplets size={40} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-4">
                      Transforming Water Management
                    </h3>
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Water is life — and to preserve and organize this life, the Panchayati Raj Department of 
                      Uttar Pradesh has launched a comprehensive Water Management System (WMS) for rural India.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Comprehensive Monitoring & Control</h4>
                      <p className="text-gray-600">Advanced monitoring systems provide complete infrastructure oversight</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Users size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Multi-Role Digital Platform</h4>
                      <p className="text-gray-600">Specialized dashboards for Admin, Gram Panchayat, and Call Center operations</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Shield size={20} className="text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">Complete Transparency</h4>
                      <p className="text-gray-600">Systematic audit trails ensure accountability at every level</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl overflow-hidden">
                  <img
                    src="/pipeline.png"
                    alt="Water Management Innovation"
                    className="w-full h-full object-cover rounded-3xl hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-2xl shadow-xl">
                  <span className="font-bold">1,08,935+ Villages Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Key Features with Interactive Cards */}
      <section className="relative py-32 px-6 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              Comprehensive Platform
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Features
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Modern technology meets rural infrastructure management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {keyFeatures.map((feature, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 overflow-hidden"
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <div className="bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full">
                      <span className="text-sm font-bold text-blue-800">{feature.stats}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{feature.description}</p>
                  
                  <div className="mt-6 flex items-center gap-2 text-purple-600 font-semibold">
                    <span>Learn More</span>
                    <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Statistics with Animation */}
      <section className="relative py-32 px-6 bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/wallpaper.png')] bg-cover opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6">
              Impact Across
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                Uttar Pradesh
              </span>
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Transforming millions of lives through systematic water management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="group relative bg-white/10 backdrop-blur-md rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl`}></div>
                
                <div className="relative z-10">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  
                  <h3 className="text-5xl font-black text-white mb-2 group-hover:scale-105 transition-transform duration-300">
                    {stat.value}
                  </h3>
                  <p className="text-lg font-semibold text-blue-200 mb-3">{stat.label}</p>
                  <p className="text-sm text-blue-100 leading-relaxed">{stat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Workflow Process - 6 Stages */}
      <section className="relative py-32 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              6-Stage Complaint
              <br />
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Resolution Process
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Systematic workflow ensuring transparent and complete complaint resolution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workflowStages.map((stage, index) => (
              <div 
                key={index}
                className={`relative group bg-gradient-to-br ${stage.color} text-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105`}
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-white text-gray-900 font-black rounded-full shadow-lg flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                </div>

                <div className="mt-6 mb-6 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  {stage.icon}
                </div>

                <div className="text-center mb-4">
                  <span className="text-sm font-semibold text-white/80 bg-white/20 px-3 py-1 rounded-full">
                    {stage.stage}
                  </span>
                </div>

                <h4 className="text-xl font-bold text-center mb-4">{stage.title}</h4>
                <p className="text-sm text-white/90 text-center leading-relaxed mb-6">
                  {stage.description}
                </p>

                <div className="space-y-2">
                  {stage.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div className="w-1.5 h-1.5 bg-white/60 rounded-full"></div>
                      <span className="text-white/80">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Project Objectives */}
      <section className="relative py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-gray-900 mb-6">
              Strategic
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Objectives
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Five key pillars of transformation for rural water management
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {objectives.map((objective, index) => (
              <div 
                key={index} 
                className="group relative bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-purple-200 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${objective.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 bg-gradient-to-br ${objective.color} rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    {objective.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-purple-700 transition-colors">
                    {objective.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">{objective.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Vision Statement */}
      <section className="relative py-32 px-6 bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/2.png')] bg-cover opacity-10"></div>
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl p-16 border border-white/20 shadow-2xl">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-xl">
                <Target size={40} className="text-white" />
              </div>
            </div>
            
            <h2 className="text-4xl font-black mb-8">
              Our Vision for
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                Tomorrow's Uttar Pradesh
              </span>
            </h2>
            
            <p className="text-xl leading-relaxed text-blue-100 mb-8">
              To create a digitally empowered rural Uttar Pradesh where every citizen has access to clean, 
              reliable water supply through transparent, efficient, and accountable water management systems. 
              We envision a future where technology bridges the gap between government services and rural 
              communities, ensuring no one is left behind in our journey towards sustainable water security.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mt-12">
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30">
                <span className="font-bold">100% Digital Coverage</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30">
                <span className="font-bold">Zero Water Scarcity</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30">
                <span className="font-bold">Complete Transparency</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer/>
    </div>
  );
};

export default About;