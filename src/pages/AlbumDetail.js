import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Row, Col, Badge, Button, Card } from "react-bootstrap";
import {
  FaArrowLeft,
  FaShoppingCart,
  FaCreditCard,
  FaTruck,
  FaShieldAlt,
} from "react-icons/fa";
import bestAlbums from "../data/best_albums.json";

export default function AlbumDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. URL의 id에 맞는 앨범 데이터 탐색
  const album = bestAlbums.find((item) => String(item.id) === String(id));

  // 2. 뷰어 상태 및 수량 상태
  const [selectedImg, setSelectedImg] = useState(album ? album.banner : "");
  const [quantity, setQuantity] = useState(1);

  if (!album) {
    return (
      <Container className="py-5 text-center text-white">
        <h3>존재하지 않는 앨범 상품입니다.</h3>
        <Button
          variant="primary"
          className="mt-3 rounded-pill"
          onClick={() => navigate("/")}
        >
          메인으로 이동
        </Button>
      </Container>
    );
  }

  // 가격 숫자 변환 (콤마 제거)
  const numericPrice = parseInt(String(album.price).replace(/,/g, ""), 10) || 0;
  const totalPrice = (numericPrice * quantity).toLocaleString();

  // 장바구니 데이터 저장 헬퍼
  const saveToCart = () => {
    const existingCart = JSON.parse(
      localStorage.getItem("contextverse_cart") || "[]",
    );
    const existingIndex = existingCart.findIndex(
      (item) => item.id === album.id,
    );

    if (existingIndex > -1) {
      existingCart[existingIndex].quantity += quantity;
    } else {
      existingCart.push({
        id: album.id,
        title: album.title,
        price: numericPrice,
        priceStr: album.price,
        banner: album.banner,
        quantity: quantity,
        badges: album.badges || [],
      });
    }

    localStorage.setItem("contextverse_cart", JSON.stringify(existingCart));
  };

  // 장바구니 담기 클릭
  const handleAddToCart = () => {
    saveToCart();
    if (
      window.confirm(
        "장바구니에 상품을 담았습니다. 장바구니로 이동하시겠습니까?",
      )
    ) {
      navigate("/cart");
    }
  };

  // 바로 구매하기 클릭 (장바구니로 즉시 연결)
  const handleBuyNow = () => {
    saveToCart();
    navigate("/cart");
  };

  return (
    <div
      className="py-5"
      style={{ minHeight: "85vh", backgroundColor: "#0b0c10" }}
    >
      <Container style={{ maxWidth: "1080px" }}>
        {/* 뒤로가기 네비게이션 */}
        <Button
          variant="link"
          className="text-secondary text-decoration-none p-0 mb-4 d-flex align-items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft size={14} /> 앨범 목록으로 돌아가기
        </Button>

        <Row className="g-5">
          {/* 좌측: 앨범 이미지 갤러리 */}
          <Col lg={6}>
            <div
              className="p-3 rounded-4 shadow-lg mb-3"
              style={{
                backgroundColor: "#11141f",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                textAlign: "center",
              }}
            >
              <img
                src={selectedImg || album.banner}
                alt={album.title}
                className="img-fluid rounded-3"
                style={{
                  maxHeight: "420px",
                  width: "100%",
                  objectFit: "contain",
                  backgroundColor: "#fff",
                }}
              />
            </div>

            {/* 썸네일 리스트 (클릭 시 큰 이미지 변경) */}
            <div className="d-flex gap-2 justify-content-center">
              {[album.banner, ...(album.thumbs || [])].map((imgUrl, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImg(imgUrl)}
                  style={{
                    width: "68px",
                    height: "68px",
                    borderRadius: "10px",
                    overflow: "hidden",
                    cursor: "pointer",
                    border:
                      selectedImg === imgUrl
                        ? "2px solid #38bdf8"
                        : "1px solid rgba(255,255,255,0.1)",
                    backgroundColor: "#fff",
                  }}
                >
                  <img
                    src={imgUrl}
                    alt="thumb"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </div>
              ))}
            </div>
          </Col>

          {/* 우측: 상품 정보 및 구매 옵션 */}
          <Col lg={6}>
            <div className="d-flex align-items-center gap-2 mb-2">
              {album.badges?.map((badge, idx) => (
                <Badge
                  key={idx}
                  bg={badge === "PICKUP" ? "primary" : "danger"}
                  className="px-2.5 py-1 text-uppercase"
                >
                  {badge}
                </Badge>
              ))}
              <span className="text-secondary small">
                공식 음반 · Weverse Shop Certified
              </span>
            </div>

            <h2 className="fw-bold text-white mb-2">{album.title}</h2>

            <div className="d-flex align-items-baseline gap-2 mb-3 pb-3 border-bottom border-secondary border-opacity-25">
              <span className="text-secondary fs-6">KRW</span>
              <span className="fw-bold text-white display-6">
                ₩{album.price}
              </span>
              <span className="text-secondary small">(세금 포함)</span>
            </div>

            {/* 배송 및 혜택 안내 */}
            <div
              className="p-3 rounded-3 mb-4"
              style={{
                backgroundColor: "#141724",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="d-flex align-items-center gap-2 text-secondary small mb-2">
                <FaTruck className="text-info" />
                <span>배송비 3,000원 (50,000원 이상 구매 시 무료 배송)</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-secondary small">
                <FaShieldAlt className="text-success" />
                <span>한터차트 & 써클차트 음반 판매량 100% 반영</span>
              </div>
            </div>

            {/* 수량 선택 박스 */}
            <div
              className="d-flex justify-content-between align-items-center mb-4 p-3 rounded-3"
              style={{
                backgroundColor: "#11141f",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span className="text-light fw-medium">주문 수량</span>
              <div className="d-flex align-items-center gap-3">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-circle px-2.5 text-white"
                  onClick={() =>
                    setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
                  }
                >
                  -
                </Button>
                <span className="fw-bold text-white fs-5">{quantity}</span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="rounded-circle px-2.5 text-white"
                  onClick={() => setQuantity((prev) => prev + 1)}
                >
                  +
                </Button>
              </div>
            </div>

            {/* 총 결제 금액 */}
            <div className="d-flex justify-content-between align-items-center mb-4 pt-2">
              <span className="text-secondary">총 상품 금액</span>
              <span className="fw-bold text-info fs-4">₩{totalPrice}</span>
            </div>

            {/* 액션 버튼 2종 */}
            <div className="d-flex gap-3">
              <Button
                variant="outline-light"
                size="lg"
                className="w-50 py-3 rounded-pill fw-semibold border-secondary d-flex align-items-center justify-content-center gap-2"
                onClick={handleAddToCart}
              >
                <FaShoppingCart size={16} /> 장바구니
              </Button>

              <Button
                variant="primary"
                size="lg"
                className="w-50 py-3 rounded-pill fw-semibold shadow d-flex align-items-center justify-content-center gap-2"
                onClick={handleBuyNow}
              >
                <FaCreditCard size={16} /> 구매하기
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
