import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { FaTrashAlt, FaArrowLeft, FaShoppingBag, FaCheckCircle } from 'react-icons/fa';

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  // 로컬스토리지에서 장바구니 데이터 로드
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('contextverse_cart') || '[]');
    setCartItems(saved);
  }, []);

  // 장바구니 갱신 헬퍼
  const updateStorage = (newItems) => {
    setCartItems(newItems);
    localStorage.setItem('contextverse_cart', JSON.stringify(newItems));
  };

  // 수량 조절
  const handleQuantity = (id, delta) => {
    const updated = cartItems.map((item) => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        return { ...item, quantity: newQty > 0 ? newQty : 1 };
      }
      return item;
    });
    updateStorage(updated);
  };

  // 단일 아이템 삭제
  const handleRemove = (id) => {
    if (window.confirm('해당 앨범을 장바구니에서 삭제하시겠습니까?')) {
      const updated = cartItems.filter((item) => item.id !== id);
      updateStorage(updated);
    }
  };

  // 전체 비우기
  const handleClear = () => {
    if (window.confirm('장바구니를 모두 비우시겠습니까?')) {
      updateStorage([]);
    }
  };

  // 금액 계산
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal > 50000 || subtotal === 0 ? 0 : 3000;
  const grandTotal = subtotal + shippingFee;

  return (
    <div className="py-5" style={{ minHeight: '85vh', backgroundColor: '#0b0c10' }}>
      <Container style={{ maxWidth: '1080px' }}>
        {/* 상단 네비게이션 */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button
            variant="link"
            className="text-secondary text-decoration-none p-0 d-flex align-items-center gap-2"
            onClick={() => navigate('/')}
          >
            <FaArrowLeft size={14} /> 메인으로 돌아가기
          </Button>

          {cartItems.length > 0 && (
            <Button variant="outline-danger" size="sm" className="rounded-pill" onClick={handleClear}>
              장바구니 비우기
            </Button>
          )}
        </div>

        <h2 className="fw-bold text-white mb-4 d-flex align-items-center gap-2">
          <FaShoppingBag className="text-primary" /> 장바구니
          <span className="text-secondary fs-5">({cartItems.length})</span>
        </h2>

        {cartItems.length === 0 ? (
          // 장바구니가 비었을 때
          <Card
            className="text-center py-5 border-0"
            style={{ backgroundColor: '#11141f', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Card.Body className="py-5">
              <FaShoppingBag size={48} className="text-secondary mb-3 opacity-50" />
              <h4 className="text-white fw-bold mb-2">장바구니가 비어 있습니다.</h4>
              <p className="text-secondary small mb-4">원하는 아티스트의 앨범을 담아보세요!</p>
              <Button variant="primary" className="rounded-pill px-4 py-2 fw-semibold shadow" onClick={() => navigate('/')}>
                앨범 구경하러 가기
              </Button>
            </Card.Body>
          </Card>
        ) : (
          // 장바구니 목록 및 주문서
          <Row className="g-4">
            {/* 좌측: 장바구니 리스트 */}
            <Col lg={8}>
              <div className="d-flex flex-column gap-3">
                {cartItems.map((item) => (
                  <Card
                    key={item.id}
                    className="border-0 p-3"
                    style={{
                      backgroundColor: '#11141f',
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      <img
                        src={item.banner}
                        alt={item.title}
                        style={{
                          width: '80px',
                          height: '80px',
                          objectFit: 'contain',
                          backgroundColor: '#fff',
                          borderRadius: '10px',
                          padding: '4px',
                        }}
                      />

                      <div className="flex-grow-1">
                        <h6 className="fw-bold text-white mb-1">{item.title}</h6>
                        <span className="text-info fw-semibold">₩{item.price.toLocaleString()}</span>
                      </div>

                      {/* 수량 조절기 */}
                      <div className="d-flex align-items-center gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="px-2 py-0 text-white border-secondary"
                          onClick={() => handleQuantity(item.id, -1)}
                        >
                          -
                        </Button>
                        <span className="text-white fw-bold px-1">{item.quantity}</span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="px-2 py-0 text-white border-secondary"
                          onClick={() => handleQuantity(item.id, 1)}
                        >
                          +
                        </Button>
                      </div>

                      {/* 소계 및 삭제 */}
                      <div className="text-end ms-2" style={{ minWidth: '90px' }}>
                        <div className="fw-bold text-white mb-1">
                          ₩{(item.price * item.quantity).toLocaleString()}
                        </div>
                        <Button
                          variant="link"
                          className="text-secondary hover-danger p-0"
                          onClick={() => handleRemove(item.id)}
                          title="삭제"
                        >
                          <FaTrashAlt size={13} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </Col>

            {/* 우측: 결제 금액 요약 박스 */}
            <Col lg={4}>
              <Card
                className="border-0 p-4 sticky-top"
                style={{
                  top: '90px',
                  backgroundColor: '#141724',
                  borderRadius: '20px',
                  border: '1px solid rgba(255,255,255,0.09)',
                }}
              >
                <h5 className="fw-bold text-white mb-3">주문 요약</h5>

                <div className="d-flex justify-content-between text-secondary small mb-2">
                  <span>총 상품금액</span>
                  <span className="text-light fw-medium">₩{subtotal.toLocaleString()}</span>
                </div>

                <div className="d-flex justify-content-between text-secondary small mb-3">
                  <span>배송비</span>
                  <span className="text-light fw-medium">
                    {shippingFee === 0 ? '무료' : `+₩${shippingFee.toLocaleString()}`}
                  </span>
                </div>

                {shippingFee > 0 && (
                  <p className="text-warning small mb-3" style={{ fontSize: '0.73rem' }}>
                    💡 ₩{(50000 - subtotal).toLocaleString()}원 추가 주문 시 무료 배송!
                  </p>
                )}

                <div className="border-top border-secondary border-opacity-25 pt-3 mb-4 d-flex justify-content-between align-items-baseline">
                  <span className="text-white fw-bold">최종 결제 금액</span>
                  <span className="fw-bold text-info fs-4">₩{grandTotal.toLocaleString()}</span>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-100 py-3 rounded-pill fw-semibold shadow d-flex align-items-center justify-content-center gap-2"
                  onClick={() => {
                    alert('데모 결제가 성공적으로 완료되었습니다! 주문 내역이 생성되었습니다.');
                    updateStorage([]);
                    navigate('/');
                  }}
                >
                  <FaCheckCircle /> ₩{grandTotal.toLocaleString()} 결제하기
                </Button>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}