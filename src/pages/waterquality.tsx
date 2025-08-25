import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useUserInfo } from '../utils/userInfo';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

interface ApiResponse {
  Data: any;
  Message: string;
  Status: boolean;
  Errror: string | null;
}

interface District {
  DistrictId: number;
  DistrictName: string;
  DistrictNameHidi: string;
}

interface Block {
  BlockId: number;
  DistrictId: number;
  BlockName: string;
  BlockNameHindi: string;
  Code: string;
}

interface GramPanchayat {
  Id: number;
  BlockId: number;
  GramPanchayatName: string;
  GramPanchayatHindi: string;
  Code: string;
}

interface Village {
  Id: number;
  GramPanchayatId: number;
  VillageName: string;
  VillageNameHindi: string;
}

const WaterQuality = () => {
  const { userId } = useUserInfo();

  // Location hierarchy states
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
  
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  
  const [gramPanchayats, setGramPanchayats] = useState<GramPanchayat[]>([]);
  const [selectedGramPanchayatId, setSelectedGramPanchayatId] = useState<number | null>(null);
  
  const [villages, setVillages] = useState<Village[]>([]);
  const [availableVillageOptions, setAvailableVillageOptions] = useState<Array<{value: number, label: string}>>([]);

  // Form states
  const [samplesCollected, setSamplesCollected] = useState(0);
  const [contaminatedSamples, setContaminatedSamples] = useState(0);
  const [villagesTested, setVillagesTested] = useState<Array<{value: number, label: string}>>([]);
  const [villagesContaminated, setVillagesContaminated] = useState<Array<{value: number, label: string}>>([]);
  const [actionTaken, setActionTaken] = useState('');
  const [status, setStatus] = useState(1);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  
  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'success' | 'error' | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // Fetch districts when userId is available
  useEffect(() => {
    if (!userId) return; // wait until we have userId
    
    const fetchDistricts = async () => {
      setIsLoadingLocation(true);
      try {
        const response = await fetch(`https://wmsapi.kdsgroup.co.in/api/Master/GetDistrict?UserId=${userId}`, {
          method: "POST",
          headers: { accept: "*/*" },
        });
        const data: ApiResponse = await response.json();
        
        if (data.Status && data.Data?.length) {
          setDistricts(data.Data);
          // Auto-select first district if only one available
          if (data.Data.length === 1) {
            setSelectedDistrictId(data.Data[0].DistrictId);
          }
        } else {
          toast.error(data.Message || 'No districts found for this user.');
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
        toast.error('Failed to load districts. Please refresh the page.');
      } finally {
        setIsLoadingLocation(false);
      }
    };

    fetchDistricts();
  }, [userId]);

  // Fetch blocks when district changes
  useEffect(() => {
    if (!selectedDistrictId || !userId) {
      setBlocks([]);
      setSelectedBlockId(null);
      return;
    }

    const fetchBlocks = async () => {
      setIsLoadingLocation(true);
      try {
        const response = await fetch("https://wmsapi.kdsgroup.co.in/api/Master/GetBlockListByDistrict", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "accept": "*/*"
          },
          body: JSON.stringify({ UserId: userId, DistrictId: selectedDistrictId }),
        });
        const data: ApiResponse = await response.json();
        
        if (data.Status && data.Data) {
          setBlocks(data.Data);
          // Auto-select first block if only one available
          if (data.Data.length === 1) {
            setSelectedBlockId(data.Data[0].BlockId);
          } else {
            setSelectedBlockId(null);
          }
        } else {
          setBlocks([]);
          setSelectedBlockId(null);
        }
      } catch (error) {
        console.error('Error fetching blocks:', error);
        toast.error('Failed to fetch blocks');
        setBlocks([]);
        setSelectedBlockId(null);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    fetchBlocks();
  }, [selectedDistrictId, userId]);

  // Fetch gram panchayats when block changes
  useEffect(() => {
    if (!selectedBlockId || !userId) {
      setGramPanchayats([]);
      setSelectedGramPanchayatId(null);
      return;
    }

    const fetchGramPanchayats = async () => {
      setIsLoadingLocation(true);
      try {
        const response = await fetch("https://wmsapi.kdsgroup.co.in/api/Master/GetGramPanchayatByBlock", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "accept": "*/*"
          },
          body: JSON.stringify({ UserId: userId, BlockId: selectedBlockId }),
        });
        const data: ApiResponse = await response.json();
        
        if (data.Status && data.Data) {
          setGramPanchayats(data.Data);
          // Auto-select first gram panchayat if only one available
          if (data.Data.length === 1) {
            setSelectedGramPanchayatId(data.Data[0].Id);
          } else {
            setSelectedGramPanchayatId(null);
          }
        } else {
          setGramPanchayats([]);
          setSelectedGramPanchayatId(null);
        }
      } catch (error) {
        console.error('Error fetching gram panchayats:', error);
        toast.error('Failed to fetch gram panchayats');
        setGramPanchayats([]);
        setSelectedGramPanchayatId(null);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    fetchGramPanchayats();
  }, [selectedBlockId, userId]);

  // Fetch villages when gram panchayat changes
  useEffect(() => {
    if (!selectedBlockId || !selectedGramPanchayatId) {
      setVillages([]);
      setAvailableVillageOptions([]);
      return;
    }

    const fetchVillages = async () => {
      setIsLoadingLocation(true);
      try {
        const response = await fetch("https://wmsapi.kdsgroup.co.in/api/Master/GetVillegeByGramPanchayat", {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "accept": "*/*"
          },
          body: JSON.stringify({ 
            BlockId: selectedBlockId, 
            GramPanchayatId: selectedGramPanchayatId 
          }),
        });
        const data: ApiResponse = await response.json();
        
        if (data.Status && data.Data) {
          setVillages(data.Data);
          
          // Convert villages to select options
          const villageOptions = data.Data.map((village: Village) => ({
            value: village.Id,
            label: village.VillageName || 'Unnamed Village'
          }));
          
          setAvailableVillageOptions(villageOptions);
        } else {
          setVillages([]);
          setAvailableVillageOptions([]);
        }
      } catch (error) {
        console.error('Error fetching villages:', error);
        toast.error('Failed to fetch villages');
        setVillages([]);
        setAvailableVillageOptions([]);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    fetchVillages();
  }, [selectedBlockId, selectedGramPanchayatId]);

  // Reset villages when location changes
  useEffect(() => {
    setVillagesTested([]);
    setVillagesContaminated([]);
  }, [selectedDistrictId, selectedBlockId, selectedGramPanchayatId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setPdfFile(file);
      } else {
        toast.error('Please select a PDF file only.');
        e.target.value = '';
      }
    }
  };

  const removeFile = () => {
    setPdfFile(null);
    const fileInput = document.getElementById('pdfReport') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleReset = () => {
    setSamplesCollected(0);
    setContaminatedSamples(0);
    setVillagesTested([]);
    setVillagesContaminated([]);
    setActionTaken('');
    setStatus(1);
    setPdfFile(null);
    setSubmitMessage('');
    setSubmitStatus(null);
    
    // Reset location selections
    setSelectedDistrictId(null);
    setSelectedBlockId(null);
    setSelectedGramPanchayatId(null);
    
    // Reset file input
    const fileInput = document.getElementById('pdfReport') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const validateForm = () => {
    if (!selectedDistrictId || !selectedBlockId || !selectedGramPanchayatId) {
      toast.error('Please select district, block, and gram panchayat.');
      return false;
    }
    if (samplesCollected <= 0) {
      toast.error('Please enter a valid number of samples collected.');
      return false;
    }
    if (contaminatedSamples > samplesCollected) {
      toast.error('Contaminated samples cannot exceed total samples collected.');
      return false;
    }
    if (villagesTested.length === 0) {
      toast.error('Please select at least one village tested.');
      return false;
    }
    if (contaminatedSamples > 0 && villagesContaminated.length === 0) {
      toast.error('Please select villages with contamination if contaminated samples > 0.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!userId) {
      toast.error('User ID not found. Please refresh the page.');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');
    setSubmitStatus(null);

    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      formData.append('SamplesCollected', samplesCollected.toString());
      formData.append('ContaminatedSamples', contaminatedSamples.toString());
      formData.append('ActionTaken', actionTaken);
      formData.append('CreatedBy', userId.toString());
      formData.append('Status', status.toString());
      
      // Handle villages tested array - using village IDs
      villagesTested.forEach((village, index) => {
        formData.append(`VillagesTested[${index}]`, village.value.toString());
      });
      
      // Handle villages with contamination array - using village IDs
      villagesContaminated.forEach((village, index) => {
        formData.append(`VillagesWithContamination[${index}]`, village.value.toString());
      });
      
      // Handle PDF file
      if (pdfFile) {
        formData.append('pdfReport', pdfFile);
      }

      console.log('Submitting Water Quality Data...');
      
      const response = await fetch('https://wmsapi.kdsgroup.co.in/api/User/InsertWaterQualityDetails', {
        method: 'POST',
        body: formData,
        headers: {
          'accept': '*/*',
        },
      });

      const result: ApiResponse = await response.json();
      
      if (result.Status) {
        toast.success(result.Message || 'Water Quality Data inserted successfully.');
        setSubmitMessage(result.Message || 'Water Quality Data inserted successfully.');
        setSubmitStatus('success');
        
        // Reset form after successful submission
        setTimeout(() => {
          handleReset();
        }, 2000);
      } else {
        const errorMessage = result.Errror || result.Message || 'Failed to submit data.';
        toast.error(errorMessage);
        setSubmitMessage(errorMessage);
        setSubmitStatus('error');
      }

    } catch (error) {
      console.error('Error submitting water quality data:', error);
      const errorMessage = 'Network error. Please check your connection and try again.';
      toast.error(errorMessage);
      setSubmitMessage(errorMessage);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedDistrict = districts.find(d => d.DistrictId === selectedDistrictId);
  const selectedBlock = blocks.find(b => b.BlockId === selectedBlockId);
  const selectedGramPanchayat = gramPanchayats.find(gp => gp.Id === selectedGramPanchayatId);

  return (
    <div className="p-6 w-full min-h-screen text-black relative z-10 bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="bg-blue-100 bg-opacity-40 rounded-xl p-4 shadow-sm mb-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-1">Water Quality Assessment Form</h1>
        <p className="text-sm text-gray-700">
          Record water quality testing data for your area. All fields are important for accurate reporting.
        </p>
        {selectedDistrict && (
          <div className="mt-2 text-sm text-blue-600">
            <span className="font-medium">Current Location: </span>
            {selectedDistrict.DistrictName}
            {selectedBlock && ` → ${selectedBlock.BlockName}`}
            {selectedGramPanchayat && ` → ${selectedGramPanchayat.GramPanchayatName}`}
          </div>
        )}
      </div>

      {/* Status Messages */}
      {submitMessage && (
        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
          submitStatus === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          {submitStatus === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{submitMessage}</span>
        </div>
      )}

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Location Selection Section */}
        <div className="bg-gray-50 p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Location Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* District */}
            <div>
              <label className="block font-medium mb-2 text-gray-700">
                District <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedDistrictId || ''}
                onChange={(e) => setSelectedDistrictId(Number(e.target.value) || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoadingLocation || districts.length === 0}
              >
                <option value="">Select District</option>
                {districts.map((district) => (
                  <option key={district.DistrictId} value={district.DistrictId}>
                    {district.DistrictName}
                  </option>
                ))}
              </select>
              {districts.length === 0 && !isLoadingLocation && (
                <p className="text-red-500 text-sm mt-1">No districts available for your account</p>
              )}
            </div>

            {/* Block */}
            <div>
              <label className="block font-medium mb-2 text-gray-700">
                Select Block <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedBlockId || ''}
                onChange={(e) => setSelectedBlockId(Number(e.target.value) || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoadingLocation || !selectedDistrictId || blocks.length === 0}
              >
                <option value="">Select Block</option>
                {blocks.map((block) => (
                  <option key={block.BlockId} value={block.BlockId}>
                    {block.BlockName}
                  </option>
                ))}
              </select>
            </div>

            {/* Gram Panchayat */}
            <div>
              <label className="block font-medium mb-2 text-gray-700">
                Gram Panchayat <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedGramPanchayatId || ''}
                onChange={(e) => setSelectedGramPanchayatId(Number(e.target.value) || null)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoadingLocation || !selectedBlockId || gramPanchayats.length === 0}
              >
                <option value="">Select Gram Panchayat</option>
                {gramPanchayats.map((gp) => (
                  <option key={gp.Id} value={gp.Id}>
                    {gp.GramPanchayatName}
                  </option>
                ))}
              </select>
            </div>

            {/* Loading indicator for location */}
            <div className="flex items-end">
              {isLoadingLocation && (
                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Loading...
                </div>
              )}
              {availableVillageOptions.length > 0 && (
                <div className="text-green-600 text-sm">
                  {availableVillageOptions.length} village{availableVillageOptions.length !== 1 ? 's' : ''} available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form Fields Section */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Samples Collected */}
            <div>
              <label className="block font-medium mb-2 text-gray-700">
                No. of Samples Collected <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={samplesCollected}
                onChange={(e) => setSamplesCollected(Number(e.target.value))}
                placeholder="Enter number of samples"
                required
              />
            </div>

            {/* Villages Tested */}
            <div>
              <label className="block font-medium mb-2 text-gray-700">
                Villages Tested <span className="text-red-500">*</span>
              </label>
              <Select
                isMulti
                options={availableVillageOptions}
                value={villagesTested}
                onChange={(selected) => setVillagesTested(selected || [])}
                className="text-black"
                placeholder={availableVillageOptions.length > 0 ? "Select villages tested..." : "Select location first"}
                isDisabled={availableVillageOptions.length === 0}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '48px',
                    borderColor: '#d1d5db',
                    '&:hover': {
                      borderColor: '#3b82f6'
                    }
                  })
                }}
              />
              {availableVillageOptions.length === 0 && (
                <p className="text-gray-500 text-sm mt-1">Please complete location selection to see available villages</p>
              )}
            </div>

            {/* Contaminated Samples */}
            <div>
              <label className="block font-medium mb-2 text-gray-700">
                No. of Contaminated Samples
              </label>
              <input
                type="number"
                min="0"
                max={samplesCollected}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                value={contaminatedSamples}
                onChange={(e) => setContaminatedSamples(Number(e.target.value))}
                placeholder="Enter number of contaminated samples"
              />
              {contaminatedSamples > samplesCollected && (
                <p className="text-red-500 text-sm mt-1">Cannot exceed total samples collected</p>
              )}
            </div>

            {/* Villages with Contamination */}
            <div>
              <label className="block font-medium mb-2 text-gray-700">
                Villages with Contamination Issues
              </label>
              <Select
                isMulti
                options={availableVillageOptions}
                value={villagesContaminated}
                onChange={(selected) => setVillagesContaminated(selected || [])}
                className="text-black"
                placeholder={availableVillageOptions.length > 0 ? "Select villages with contamination..." : "Select location first"}
                isDisabled={availableVillageOptions.length === 0}
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '48px',
                    borderColor: '#d1d5db',
                    '&:hover': {
                      borderColor: '#3b82f6'
                    }
                  })
                }}
              />
            </div>
            {/* PDF Report Upload */}
            <div className="lg:col-span-2">
              <label className="block font-medium mb-2 text-gray-700">
                PDF Report
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                {pdfFile ? (
                  <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{pdfFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={removeFile}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Click to upload PDF report</p>
                    <p className="text-sm text-gray-400">PDF files only, max 10MB</p>
                  </div>
                )}
                <input
                  type="file"
                  id="pdfReport"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {!pdfFile && (
                  <button
                    onClick={() => document.getElementById('pdfReport')?.click()}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Choose File
                  </button>
                )}
              </div>
            </div>

            {/* Action Taken */}
            <div className="lg:col-span-2">
              <label className="block font-medium mb-2 text-gray-700">
                Action Taken
              </label>
              <textarea
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
                placeholder="Describe any actions taken regarding water quality issues..."
              />
            </div>

            {/* Summary Card */}
            {samplesCollected > 0 && (
              <div className="lg:col-span-2 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-2">Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Total Samples:</span>
                    <span className="font-medium ml-2">{samplesCollected}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Contaminated:</span>
                    <span className={`font-medium ml-2 ${contaminatedSamples > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {contaminatedSamples}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Success Rate:</span>
                    <span className="font-medium ml-2 text-green-600">
                      {samplesCollected > 0 ? ((samplesCollected - contaminatedSamples) / samplesCollected * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Villages Tested:</span>
                    <span className="font-medium ml-2">{villagesTested.length}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="lg:col-span-2 flex justify-end gap-4 mt-6">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-black px-8 py-3 rounded-lg transition-colors font-medium"
                onClick={handleReset}
                disabled={isSubmitting}
              >
                Reset
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || availableVillageOptions.length === 0}
                className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                  isSubmitting || availableVillageOptions.length === 0
                    ? 'bg-blue-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Data'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterQuality;