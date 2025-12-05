import React, { useState } from 'react';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  Shield, 
  Lock, 
  Eye, 
  FileText, 
  Users, 
  Database, 
  Globe, 
  Mail,
  MapPin,
  Cookie,
  AlertCircle,
  CheckCircle2,
  Clock,
  Server,
  UserCheck,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const PrivacyPolicy = () => {
  const [expandedSection, setExpandedSection] = useState<number | null>(0);

  const toggleSection = (index: number) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const sections = [
    {
      id: 'interpretation',
      icon: <FileText size={24} />,
      title: 'Interpretation and Definitions',
      color: 'from-blue-500 to-cyan-500',
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Interpretation</h4>
            <p className="text-gray-700 leading-relaxed">
              The words whose initial letters are capitalized have meanings defined under the following conditions. 
              The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-gray-900 mb-4">Definitions</h4>
            <div className="grid gap-4">
              {[
                { term: 'Account', def: 'A unique account created for You to access our Service or parts of our Service.' },
                { term: 'Application', def: 'Refers to Water Management System, the software program provided by the Company.' },
                { term: 'Company', def: 'Refers to Water Management System (referred to as "the Company", "We", "Us" or "Our").' },
                { term: 'Cookies', def: 'Small files placed on Your device containing browsing history details.' },
                { term: 'Country', def: 'Refers to: Uttar Pradesh, India' },
                { term: 'Device', def: 'Any device that can access the Service such as a computer, cell phone or tablet.' },
                { term: 'Personal Data', def: 'Any information that relates to an identified or identifiable individual.' },
                { term: 'Service', def: 'Refers to the Application or the Website or both.' },
                { term: 'Usage Data', def: 'Data collected automatically from use of the Service or Service infrastructure.' },
                { term: 'Website', def: 'Water Management System, accessible from https://wms.prd.kdsgroup.co.in' }
              ].map((item, idx) => (
                <div key={idx} className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                  <p className="font-semibold text-blue-900 mb-1">{item.term}</p>
                  <p className="text-gray-700 text-sm">{item.def}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'data-collection',
      icon: <Database size={24} />,
      title: 'Data Collection',
      color: 'from-purple-500 to-pink-500',
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck size={20} className="text-purple-600" />
              Personal Data We Collect
            </h4>
            <p className="text-gray-700 mb-4">
              While using Our Service, We may ask You to provide certain personally identifiable information:
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {['Email address', 'First name and last name', 'Phone number', 'Address, State, Province, ZIP/Postal code, City', 'Usage Data'].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg">
                  <CheckCircle2 size={18} className="text-purple-600 flex-shrink-0" />
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Server size={20} className="text-purple-600" />
              Usage Data
            </h4>
            <p className="text-gray-700 mb-3">Usage Data is collected automatically when using the Service and may include:</p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Your Device's Internet Protocol address (IP address)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Browser type and version</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Pages visited, time and date of visit, time spent on pages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Unique device identifiers and diagnostic data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 mt-1">•</span>
                <span>Mobile device information (type, unique ID, IP address, operating system)</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'cookies',
      icon: <Cookie size={24} />,
      title: 'Tracking Technologies and Cookies',
      color: 'from-orange-500 to-red-500',
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 leading-relaxed">
            We use Cookies and similar tracking technologies to track activity on Our Service and store certain information. 
            Technologies include beacons, tags, and scripts to collect and track information and improve our Service.
          </p>

          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <h5 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                <Cookie size={20} />
                Necessary / Essential Cookies
              </h5>
              <p className="text-sm text-gray-700 mb-2"><strong>Type:</strong> Session Cookies</p>
              <p className="text-sm text-gray-700 mb-2"><strong>Administered by:</strong> Us</p>
              <p className="text-gray-700">
                <strong>Purpose:</strong> Essential to provide services and enable features. They authenticate users 
                and prevent fraudulent use of accounts. Without these Cookies, requested services cannot be provided.
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <h5 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                <CheckCircle2 size={20} />
                Cookies Policy / Notice Acceptance Cookies
              </h5>
              <p className="text-sm text-gray-700 mb-2"><strong>Type:</strong> Persistent Cookies</p>
              <p className="text-sm text-gray-700 mb-2"><strong>Administered by:</strong> Us</p>
              <p className="text-gray-700">
                <strong>Purpose:</strong> Identify if users have accepted the use of cookies on the Website.
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <h5 className="font-bold text-orange-900 mb-3 flex items-center gap-2">
                <Settings size={20} />
                Functionality Cookies
              </h5>
              <p className="text-sm text-gray-700 mb-2"><strong>Type:</strong> Persistent Cookies</p>
              <p className="text-sm text-gray-700 mb-2"><strong>Administered by:</strong> Us</p>
              <p className="text-gray-700">
                <strong>Purpose:</strong> Remember choices You make (login details, language preference) to provide 
                a more personal experience and avoid re-entering preferences.
              </p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> You can instruct Your browser to refuse all Cookies or indicate when a Cookie is being sent. 
              However, if You do not accept Cookies, You may not be able to use some parts of our Service.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'use-of-data',
      icon: <Settings size={24} />,
      title: 'Use of Your Personal Data',
      color: 'from-green-500 to-emerald-500',
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 mb-4">The Company may use Personal Data for the following purposes:</p>
          
          <div className="space-y-3">
            {[
              { title: 'Service Provision', desc: 'To provide and maintain our Service, including monitoring usage.' },
              { title: 'Account Management', desc: 'To manage Your registration and provide access to different functionalities.' },
              { title: 'Contract Performance', desc: 'Development and compliance of purchase contracts for products or services.' },
              { title: 'Contact You', desc: 'Via email, phone, SMS, or push notifications regarding updates, security, or informative communications.' },
              { title: 'News & Offers', desc: 'Provide news, special offers, and information about similar goods and services (unless opted out).' },
              { title: 'Request Management', desc: 'Attend and manage Your requests to Us.' },
              { title: 'Business Transfers', desc: 'Evaluate or conduct mergers, acquisitions, or asset transfers.' },
              { title: 'Data Analysis', desc: 'Usage trends, promotional campaign effectiveness, and service improvement.' }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-green-50 p-4 rounded-lg border border-green-200">
                <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-green-900 mb-1">{item.title}</p>
                  <p className="text-gray-700 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'data-sharing',
      icon: <Users size={24} />,
      title: 'Sharing Your Information',
      color: 'from-indigo-500 to-purple-500',
      content: (
        <div className="space-y-6">
          <p className="text-gray-700 mb-4">We may share Your personal information in the following situations:</p>
          
          <div className="grid gap-4">
            {[
              { title: 'Service Providers', desc: 'To monitor and analyze use of our Service and to contact You.' },
              { title: 'Business Transfers', desc: 'During negotiations or completion of merger, sale, financing, or acquisition.' },
              { title: 'Affiliates', desc: 'With parent company, subsidiaries, or joint venture partners who honor this Privacy Policy.' },
              { title: 'Business Partners', desc: 'To offer certain products, services or promotions.' },
              { title: 'Other Users', desc: 'When You share information in public areas, it may be viewed by all users.' },
              { title: 'With Your Consent', desc: 'For any other purpose with Your explicit consent.' }
            ].map((item, idx) => (
              <div key={idx} className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
                <p className="font-semibold text-indigo-900 mb-2">{item.title}</p>
                <p className="text-gray-700 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'data-retention',
      icon: <Clock size={24} />,
      title: 'Data Retention & Transfer',
      color: 'from-teal-500 to-cyan-500',
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Clock size={20} className="text-teal-600" />
              Retention Period
            </h4>
            <p className="text-gray-700 mb-3">
              The Company will retain Your Personal Data only for as long as necessary for purposes set out in this Privacy Policy.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-teal-600 flex-shrink-0 mt-1" />
                <span>Retained to comply with legal obligations</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-teal-600 flex-shrink-0 mt-1" />
                <span>Used to resolve disputes and enforce agreements</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-teal-600 flex-shrink-0 mt-1" />
                <span>Usage Data retained for shorter periods unless needed for security or functionality</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Globe size={20} className="text-teal-600" />
              Data Transfer
            </h4>
            <p className="text-gray-700 mb-3">
              Your information, including Personal Data, is processed at the Company's operating offices and other locations 
              where parties involved in processing are located. This may include transfer to computers outside Your jurisdiction 
              where data protection laws may differ.
            </p>
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                <strong>Your Consent:</strong> Your consent to this Privacy Policy followed by submission of information 
                represents Your agreement to that transfer. The Company takes all reasonable steps to ensure data is treated 
                securely and no transfer occurs without adequate controls.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'your-rights',
      icon: <Eye size={24} />,
      title: 'Your Rights & Data Control',
      color: 'from-violet-500 to-purple-500',
      content: (
        <div className="space-y-6">
          <div className="bg-violet-50 border border-violet-200 rounded-xl p-6">
            <h4 className="font-bold text-violet-900 mb-4 flex items-center gap-2">
              <Eye size={20} />
              Delete Your Personal Data
            </h4>
            <p className="text-gray-700 mb-4">
              You have the right to delete or request that We assist in deleting the Personal Data We have collected about You.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-violet-600 flex-shrink-0 mt-1" />
                <span>Delete certain information from within the Service</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-violet-600 flex-shrink-0 mt-1" />
                <span>Update, amend, or delete Your information via account settings</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-violet-600 flex-shrink-0 mt-1" />
                <span>Contact Us to request access, correction, or deletion of personal information</span>
              </li>
            </ul>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded-r-lg mt-4">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> We may need to retain certain information when we have a legal obligation or lawful basis to do so.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'disclosure',
      icon: <AlertCircle size={24} />,
      title: 'Disclosure Requirements',
      color: 'from-red-500 to-pink-500',
      content: (
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-gray-900 mb-3">Business Transactions</h4>
            <p className="text-gray-700">
              If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. 
              We will provide notice before transfer and when it becomes subject to a different Privacy Policy.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3">Law Enforcement</h4>
            <p className="text-gray-700">
              Under certain circumstances, the Company may be required to disclose Your Personal Data if required by law 
              or in response to valid requests by public authorities (e.g., court or government agency).
            </p>
          </div>

          <div>
            <h4 className="font-bold text-gray-900 mb-3">Other Legal Requirements</h4>
            <p className="text-gray-700 mb-3">The Company may disclose Your Personal Data in good faith belief that such action is necessary to:</p>
            <ul className="space-y-2 text-gray-700">
              {[
                'Comply with a legal obligation',
                'Protect and defend the rights or property of the Company',
                'Prevent or investigate possible wrongdoing in connection with the Service',
                'Protect the personal safety of Users or the public',
                'Protect against legal liability'
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 'security',
      icon: <Lock size={24} />,
      title: 'Security & Safety',
      color: 'from-slate-600 to-gray-700',
      content: (
        <div className="space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Lock size={20} />
              Security of Your Personal Data
            </h4>
            <p className="text-gray-700 mb-4">
              The security of Your Personal Data is important to Us. While We strive to use commercially acceptable means 
              to protect Your Personal Data, We cannot guarantee its absolute security.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <p className="text-sm text-gray-700">
                <strong>Important:</strong> No method of transmission over the Internet or electronic storage is 100% secure. 
                We implement industry-standard security measures but cannot guarantee absolute security.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Shield size={20} />
              Children's Privacy
            </h4>
            <p className="text-gray-700 mb-3">
              Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable 
              information from anyone under 13.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-slate-600 flex-shrink-0 mt-1" />
                <span>If You are a parent/guardian aware Your child has provided Personal Data, please contact Us</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-slate-600 flex-shrink-0 mt-1" />
                <span>We take steps to remove information collected from under-13s without parental consent</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={18} className="text-slate-600 flex-shrink-0 mt-1" />
                <span>May require parental consent where Your country mandates it</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
            <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Globe size={20} />
              Links to Other Websites
            </h4>
            <p className="text-gray-700">
              Our Service may contain links to third-party websites not operated by Us. We strongly advise reviewing 
              the Privacy Policy of every site You visit. We have no control over and assume no responsibility for 
              content, privacy policies, or practices of third-party sites or services.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'changes',
      icon: <FileText size={24} />,
      title: 'Policy Changes',
      color: 'from-amber-500 to-orange-500',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            We may update Our Privacy Policy from time to time. We will notify You of changes by:
          </p>
          <div className="space-y-3">
            {[
              'Posting the new Privacy Policy on this page',
              'Sending email notifications',
              'Displaying a prominent notice on Our Service',
              'Updating the "Last updated" date'
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <CheckCircle2 size={18} className="text-amber-600 flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-lg mt-4">
            <p className="text-sm text-gray-700">
              <strong>Recommendation:</strong> Review this Privacy Policy periodically for any changes. 
              Changes are effective when posted on this page.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Navbar />
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 text-white py-24 px-6">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full mb-6 border border-white/20">
            <Shield size={24} />
            <span className="font-semibold">Privacy Policy</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight">
            Your Privacy Matters
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Understanding how we collect, use, and protect your personal information
          </p>
          <div className="mt-8 text-sm text-blue-200">
            Last Updated: December 2024
          </div>
        </div>
      </div>

      {/* Introduction */}
      <section className="relative py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <FileText size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">About This Privacy Policy</h2>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of 
                  Your information when You use the Water Management System (WMS) and tells You about Your privacy 
                  rights and how the law protects You.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We use Your Personal data to provide and improve the Service. By using the Service, You agree to 
                  the collection and use of information in accordance with this Privacy Policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Accordion Sections */}
      <section className="relative py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <button
                onClick={() => toggleSection(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${section.color} rounded-xl flex items-center justify-center text-white`}>
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                </div>
                {expandedSection === index ? (
                  <ChevronUp size={24} className="text-gray-400" />
                ) : (
                  <ChevronDown size={24} className="text-gray-400" />
                )}
              </button>
              
              {expandedSection === index && (
                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative py-16 px-6 bg-gradient-to-r from-blue-950 via-blue-900 to-cyan-800 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-12 border border-white/20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-white/10 px-6 py-3 rounded-full mb-4">
                <Mail size={20} />
                <span className="font-semibold">Contact Us</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">Questions About Privacy?</h2>
              <p className="text-blue-100 text-lg">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
                <Mail size={24} className="text-cyan-400" />
                <div>
                  <p className="text-sm text-blue-200">Email</p>
                  <a href="mailto:kdsservices25@gmail.com" className="text-lg font-semibold hover:text-cyan-300 transition-colors">
                    kdsdeveloper25@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20">
                <MapPin size={24} className="text-cyan-400" />
                <div>
                  <p className="text-sm text-blue-200">Location</p>
                  <p className="text-lg font-semibold">Uttar Pradesh, India</p>
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

export default PrivacyPolicy;