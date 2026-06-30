import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Upload, X, Check, Image as ImageIcon } from 'lucide-react';
import getCroppedImg from '../../utils/cropImage';
import { uploadSeniorPhoto, updateSeniorPhotoUrl } from '../../api/juniorApi';

const ImageCropperModal = ({ 
  isOpen, 
  onClose, 
  onUploadSuccess,
  title = "UPLOAD PHOTO",
  description = "คลิกเพื่อเลือกรูปภาพ",
  aspectRatio = 3/4,
  uploadFunction
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  if (!isOpen) return null;

  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result));
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    try {
      setUploading(true);
      const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
      const file = new File([croppedImage], 'avatar.jpg', { type: 'image/jpeg' });
      
      await uploadFunction(file);
      
      if (onUploadSuccess) onUploadSuccess();
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      alert("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0b0914] border border-[#7ecfff]/30 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col shadow-[0_0_30px_rgba(126,207,255,0.15)] relative">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-[#7ecfff]/20 bg-black/50 shrink-0">
          <h2 className="text-xl font-bold text-[#99eedd] font-['Orbitron'] flex items-center gap-2">
            <ImageIcon size={20} />
            {title}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable in Landscape */}
        <div className="p-4 md:p-6 flex-1 flex flex-col items-center overflow-y-auto">
          {description && (
            <p className="text-[#d966ff] font-['Chakra_Petch'] mb-4 text-center text-sm">
              {description}
            </p>
          )}
          {!imageSrc ? (
            <div className="relative w-full h-[300px] md:h-[400px] max-h-[50vh] border-2 border-dashed border-[#7ecfff]/30 rounded-xl flex flex-col items-center justify-center gap-4 bg-white/5 hover:bg-white/10 transition-colors">
              <ImageIcon size={48} className="text-[#7ecfff]/50" />
              <p className="text-gray-400 font-['Chakra_Petch'] text-center px-4">คลิกเพื่อเลือกรูปภาพ (อัตราส่วน {aspectRatio === 1 ? '1:1' : '3:4'})</p>
              <input 
                type="file" 
                accept="image/*" 
                onChange={onFileChange} 
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
          ) : (
            <div className="relative w-full h-[300px] md:h-[400px] max-h-[50vh] bg-black/50 rounded-xl overflow-hidden border border-[#7ecfff]/20">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
          )}

          {imageSrc && (
            <div className="w-full mt-4 shrink-0">
              <label className="text-xs text-[#99eedd] mb-2 block font-['Orbitron']">ZOOM</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                className="w-full accent-[#7ecfff]"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#7ecfff]/20 bg-black/50 flex justify-end gap-3 shrink-0">
          <button 
            onClick={() => setImageSrc(null)} 
            className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:bg-white/10 font-['Orbitron'] transition-colors"
          >
            RESET
          </button>
          <button 
            onClick={handleUpload}
            disabled={!imageSrc || uploading}
            className="flex items-center gap-2 px-6 py-2 bg-[#7ecfff]/20 hover:bg-[#7ecfff]/40 border border-[#7ecfff]/50 text-[#7ecfff] rounded-lg font-bold font-['Orbitron'] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
               <span>UPLOADING...</span>
            ) : (
              <>
                <Check size={16} /> CONFIRM
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default ImageCropperModal;
