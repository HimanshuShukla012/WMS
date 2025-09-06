import Navbar from "../components/Navbar"; // adjust the path if it's in a different folder
import Footer from "../components/Footer";
import { useState } from 'react';
import { FileText, Download, Calendar, HardDrive, Eye, CheckCircle } from 'lucide-react';

// Mock data for guidelines - you can replace this with actual data
const guidelines = [
  {
    id: 1,
    title: "Government Order for Operation and Maintenance Policy-2024",
    description: "Regarding guidelines for compliance of Operation and Maintenance Policy-2024 issued for operation and maintenance of pipe drinking water schemes in rural areas of the state.",
    filename: "Rural Water Supply GO_21-May-25.pdf",
    filesize: "0.57 MB",
    uploadDate: "2025-05-21",
    category: "Government Order (GO)",
    version: "v1.0",
    downloadUrl: "/Rural Water Supply GO_21-May-25.pdf"
  },
  
];

const categories = ["All", "Government Order (GO)", "Guidelines"];

const GuidelinesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // Filter guidelines based on category and search term
  const filteredGuidelines = guidelines.filter(guideline => {
    const matchesCategory = selectedCategory === "All" || guideline.category === selectedCategory;
    const matchesSearch = guideline.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         guideline.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDownload = (guideline) => {
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = guideline.downloadUrl;
    link.download = guideline.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      "Implementation": "from-blue-500 to-blue-600",
      "Quality Control": "from-green-500 to-green-600",
      "Beneficiary Management": "from-purple-500 to-purple-600",
      "Complaint Management": "from-orange-500 to-orange-600",
      "Guidelines": "from-indigo-500 to-indigo-600",
      "Government Order (GO)": "from-red-500 to-red-600"
    };
    return colors[category] || "from-gray-500 to-gray-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a2540] via-[#103c63] to-[#144e77]">
        <Navbar />
      {/* Hero Section */}
      <div className="relative py-20 px-6 md:px-24">
        
        <div className="absolute inset-0 bg-[url('/wallpaper.png')] bg-cover opacity-20"></div>
        
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/10 backdrop-blur-md rounded-full p-4">
              <FileText size={48} className="text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Government Order (G.O.) & Guidelines
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
            Comprehensive guidelines and documentation following Government of India's Guidelines for Water Management across the state of Uttar Pradesh
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="px-6 md:px-24 mb-12">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search guidelines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-white text-blue-900 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Guidelines Grid */}
      <div className="px-6 md:px-24 pb-24">
        <div className="mb-8">
          <p className="text-white/80 text-lg">
            Found <span className="font-bold text-white">{filteredGuidelines.length}</span> guidelines
            {selectedCategory !== "All" && (
              <span> in <span className="font-bold text-white">{selectedCategory}</span></span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredGuidelines.map((guideline) => (
            <div
              key={guideline.id}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border border-white/20"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="bg-green-500 rounded-xl p-3">
                    <FileText size={24} className="text-white" />
                  </div>
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getCategoryColor(guideline.category)}`}>
                      {guideline.category}
                    </span>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="bg-white/20 px-2 py-1 rounded text-xs text-white">
                        {guideline.version}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                {guideline.title}
              </h3>

              {/* Description */}
              <p className="text-white/80 text-sm leading-relaxed mb-6">
                {guideline.description}
              </p>

              {/* File Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <HardDrive size={16} className="text-white/60" />
                  <span className="text-white/80 text-sm">{guideline.filesize}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-white/60" />
                  <span className="text-white/80 text-sm">{formatDate(guideline.uploadDate)}</span>
                </div>
              </div>

              {/* File Name */}
              <div className="bg-white/5 rounded-lg p-3 mb-6">
                <p className="text-white/90 text-sm font-mono break-all">
                  📄 {guideline.filename}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => handleDownload(guideline)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  <Download size={18} />
                  Download PDF
                </button>
                <button
                  onClick={() => window.open(guideline.downloadUrl, '_blank')}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Eye size={18} />
                  Preview
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredGuidelines.length === 0 && (
          <div className="text-center py-16">
            <div className="bg-white/10 backdrop-blur-md rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
              <FileText size={40} className="text-white/60" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">No Guidelines Found</h3>
            <p className="text-white/70 max-w-md mx-auto">
              No guidelines match your current search criteria. Try adjusting your search terms or selecting a different category.
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="mt-6 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Additional Info Section */}
      <div className="bg-white/5 backdrop-blur-md border-t border-white/10">
        <div className="px-6 md:px-24 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="text-center">
              <div className="bg-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <FileText size={32} className="text-white" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Comprehensive Documentation</h4>
              <p className="text-white/70 text-sm">
                Detailed procedures and specifications for effective implementation
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Download size={32} className="text-white" />
              </div>
              <h4 className="text-lg font-bold text-white mb-2">Easy Access</h4>
              <p className="text-white/70 text-sm">
                Download and access guidelines anytime for reference and implementation
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default GuidelinesPage;