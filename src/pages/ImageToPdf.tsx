import { useState, useCallback } from "react";
import { Upload, X, Download, Image as ImageIcon, Crop, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import Cropper from "react-easy-crop";
import { jsPDF } from "jspdf";
import { toast } from "sonner";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  croppedArea: { x: number; y: number; width: number; height: number } | null;
}

const ImageToPdf = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [currentStep, setCurrentStep] = useState<"upload" | "crop" | "name">("upload");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [pdfFileName, setPdfFileName] = useState("document.pdf");

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      toast.error("Please select valid image files");
      return;
    }

    const newImages: ImageFile[] = imageFiles.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      croppedArea: null,
    }));

    setImages(newImages);
    toast.success(`${imageFiles.length} image(s) loaded`);
  };

  const removeImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
  };

  const saveCrop = () => {
    if (croppedAreaPixels) {
      const updatedImages = [...images];
      updatedImages[currentImageIndex].croppedArea = croppedAreaPixels;
      setImages(updatedImages);
    }

    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } else {
      setCurrentStep("name");
    }
  };

  const skipCrop = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
    } else {
      setCurrentStep("name");
    }
  };

  const createPDF = async () => {
    try {
      const pdf = new jsPDF();
      let isFirstPage = true;

      for (const image of images) {
        const img = new Image();
        img.src = image.preview;
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) continue;

        let sourceX = 0;
        let sourceY = 0;
        let sourceWidth = img.width;
        let sourceHeight = img.height;

        if (image.croppedArea) {
          sourceX = image.croppedArea.x;
          sourceY = image.croppedArea.y;
          sourceWidth = image.croppedArea.width;
          sourceHeight = image.croppedArea.height;
        }

        canvas.width = sourceWidth;
        canvas.height = sourceHeight;

        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          sourceWidth,
          sourceHeight
        );

        const imgData = canvas.toDataURL("image/jpeg", 0.95);

        if (!isFirstPage) {
          pdf.addPage();
        }
        isFirstPage = false;

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgAspect = sourceWidth / sourceHeight;
        const pageAspect = pageWidth / pageHeight;

        let finalWidth = pageWidth;
        let finalHeight = pageHeight;

        if (imgAspect > pageAspect) {
          finalHeight = pageWidth / imgAspect;
        } else {
          finalWidth = pageHeight * imgAspect;
        }

        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        pdf.addImage(imgData, "JPEG", x, y, finalWidth, finalHeight);
      }

      pdf.save(pdfFileName);
      toast.success("PDF created successfully!");
      
      // Reset
      setImages([]);
      setCurrentStep("upload");
      setCurrentImageIndex(0);
      setPdfFileName("document.pdf");
    } catch (error) {
      console.error("Error creating PDF:", error);
      toast.error("Failed to create PDF");
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Image to PDF</h1>
            <p className="text-muted-foreground mt-1">Convert multiple images into a single PDF document</p>
          </div>
        </div>

        {currentStep === "upload" && (
          <Card className="p-8 gradient-card">
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 gradient-primary rounded-2xl flex items-center justify-center shadow-glow-blue">
                  <ImageIcon className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Upload Images</h2>
                <p className="text-muted-foreground">Select one or more images to convert to PDF</p>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="image-upload"
                  multiple
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop<br />
                    PNG, JPG, JPEG, WebP (max 20MB each)
                  </p>
                </label>
              </div>

              {images.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Selected Images ({images.length})</h3>
                    <Button onClick={() => setCurrentStep("crop")} className="gradient-primary">
                      Next: Crop Images
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.preview}
                          alt={image.name}
                          className="w-full h-32 object-cover rounded-lg border border-border"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeImage(image.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1 truncate">{image.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {currentStep === "crop" && images.length > 0 && (
          <Card className="p-8 gradient-card">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Crop Images</h2>
                  <p className="text-muted-foreground">
                    Image {currentImageIndex + 1} of {images.length}: {images[currentImageIndex].name}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={skipCrop}>
                    Skip
                  </Button>
                  <Button onClick={saveCrop} className="gradient-primary">
                    <Crop className="h-4 w-4 mr-2" />
                    {currentImageIndex < images.length - 1 ? "Next Image" : "Finish Cropping"}
                  </Button>
                </div>
              </div>

              <div className="relative h-[500px] bg-black/10 rounded-lg overflow-hidden">
                <Cropper
                  image={images[currentImageIndex].preview}
                  crop={crop}
                  zoom={zoom}
                  aspect={undefined}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              <div className="space-y-2">
                <Label>Zoom</Label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </Card>
        )}

        {currentStep === "name" && (
          <Card className="p-8 gradient-card">
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 gradient-primary rounded-2xl flex items-center justify-center shadow-glow-blue">
                  <FileText className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Name Your PDF</h2>
                <p className="text-muted-foreground">Choose a name for your PDF document</p>
              </div>

              <div className="space-y-4 max-w-md mx-auto">
                <div className="space-y-2">
                  <Label htmlFor="pdf-name">PDF File Name</Label>
                  <Input
                    id="pdf-name"
                    value={pdfFileName}
                    onChange={(e) => setPdfFileName(e.target.value)}
                    placeholder="document.pdf"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentStep("crop");
                      setCurrentImageIndex(0);
                    }}
                    className="flex-1"
                  >
                    Back to Crop
                  </Button>
                  <Button
                    onClick={createPDF}
                    disabled={!pdfFileName.trim()}
                    className="flex-1 gradient-primary"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Create PDF
                  </Button>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold mb-4 text-center">Preview ({images.length} images)</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {images.map((image, index) => (
                    <div key={image.id} className="text-center">
                      <img
                        src={image.preview}
                        alt={`Page ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border border-border"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Page {index + 1}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default ImageToPdf;
