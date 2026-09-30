import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "../api/axios.js";
import PageHeader from "../components/PageHeader.jsx";

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AddFood() {
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [type, setType] = useState("packaged");
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState("");
  const [image, setImage] = useState(null);
  const [detecting, setDetecting] = useState(false);
  const [detectMsg, setDetectMsg] = useState("");
  const [loading, setLoading] = useState(isEdit);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/food/${id}`).then((res) => {
      const item = res.data;
      setType(item.type);
      setName(item.name);
      setQuantity(item.quantity || "1");
      setPurchaseDate(item.purchaseDate ? item.purchaseDate.slice(0, 10) : "");
      setExpiryDate(item.expiryDate ? item.expiryDate.slice(0, 10) : "");
      setImage(item.imageBase64 || null);
      setLoading(false);
    });
  }, [id, isEdit]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setImage(base64);
  };

  const handleDetectExpiry = async () => {
    if (!image) return;
    setDetecting(true);
    setDetectMsg("");
    try {
      const res = await api.post("/food/detect-expiry", { imageBase64: image });
      if (res.data.detected) {
        setExpiryDate(res.data.expiryDate);
        setDetectMsg("Expiry date detected from image.");
      } else {
        setDetectMsg(res.data.message || "Could not detect expiry. Please enter it manually.");
      }
    } catch (err) {
      setDetectMsg("Detection failed. Please enter the expiry date manually.");
    } finally {
      setDetecting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      type,
      quantity,
      purchaseDate,
      expiryDate: type === "packaged" ? expiryDate : undefined,
      imageBase64: image,
    };
    if (isEdit) {
      await api.patch(`/food/${id}`, payload);
    } else {
      await api.post("/food", payload);
    }
    navigate("/inventory");
  };

  if (loading) return <div className="page"><p className="empty-note">Loading item...</p></div>;

  return (
    <div className="page">
      <button className="back-link" onClick={() => navigate("/inventory")}>
        <ArrowLeft size={15} /> Back to Inventory
      </button>
      <PageHeader
        title={isEdit ? "Edit Food Item" : "Add Food Item"}
        subtitle={isEdit ? "Update the details for this item." : "Log something you've just brought home."}
      />

      <form onSubmit={handleSubmit} className="panel food-form">
        <div className="type-toggle">
          <button type="button" className={type === "packaged" ? "active" : ""} onClick={() => setType("packaged")}>
            Packaged Food
          </button>
          <button type="button" className={type === "fresh" ? "active" : ""} onClick={() => setType("fresh")}>
            Fresh Produce
          </button>
        </div>

        <label>
          Food Name
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Corn Flakes" required />
        </label>

        <div className="form-row">
          <label>
            Quantity
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          </label>
          <label>
            Purchase Date
            <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required />
          </label>
        </div>

        {type === "packaged" && (
          <>
            <label>
              Product Image <span className="label-hint">(optional)</span>
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </label>

            {image && (
              <button type="button" className="btn-secondary" onClick={handleDetectExpiry} disabled={detecting}>
                {detecting ? "Detecting..." : "Detect Expiry from Image"}
              </button>
            )}
            {detectMsg && <p className="hint">{detectMsg}</p>}

            <label>
              Expiry Date
              <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </label>
          </>
        )}

        <button type="submit" className="btn-primary form-submit">
          {isEdit ? "Save Changes" : "Save Food Item"}
        </button>
      </form>
    </div>
  );
}
