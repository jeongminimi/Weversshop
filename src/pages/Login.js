import React, { useState } from 'react';
import { Container, Card, Form, Button, Badge } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { FaLock, FaEnvelope, FaCrown, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { SiApple } from 'react-icons/si';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해 주세요.');
      return;
    }
    // 포트폴리오 데모 로그인 성공 처리
    alert(`환영합니다! ${email} 계정으로 로그인되었습니다.`);
    navigate('/');
  };

  return (
    <div className="py-5" style={{ minHeight: '85vh', display: 'flex', alignItems: 'center' }}>
      <Container style={{ maxWidth: '440px' }}>
        {/* 뒤로가기 버튼 */}
        <Button
          variant="link"
          className="text-secondary text-decoration-none p-0 mb-3 d-flex align-items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft size={14} /> 홈으로 돌아가기
        </Button>

        <Card 
          className="border-0 shadow-lg" 
          style={{ 
            backgroundColor: '#11141f', 
            borderRadius: '24px', 
            border: '1px solid rgba(255, 255, 255, 0.09)',
            overflow: 'hidden'
          }}
        >
          {/* 상단 멤버십 안내 배너 */}
          <div 
            className="p-3 text-center" 
            style={{ 
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(56, 189, 248, 0.15))',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div className="d-flex justify-content-center align-items-center gap-1.5 mb-1">
              <FaCrown size={15} style={{ color: '#eab308' }} />
              <span className="fw-bold text-white small">Weverse Membership Only</span>
            </div>
            <p className="text-secondary small mb-0" style={{ fontSize: '0.74rem' }}>
              공식 멤버십 독점 피드 및 티켓 선예매는 로그인 후 이용 가능합니다.
            </p>
          </div>

          <Card.Body className="p-4 p-sm-5">
            {/* 브랜드 로고 및 타이틀 */}
            <div className="text-center mb-4">
              <Badge className="badge-ai px-3 py-1 rounded-pill mb-2">
                Single Sign-On
              </Badge>
              <h3 className="fw-bold text-white mb-1">Weverse Account</h3>
              <p className="text-secondary small">하나의 계정으로 모든 아티스트와 소통하세요.</p>
            </div>

            {/* 로그인 폼 */}
            <Form onSubmit={handleLoginSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="text-secondary small fw-semibold">이메일 주소</Form.Label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <FaEnvelope size={14} />
                  </span>
                  <Form.Control
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-black text-white border-secondary"
                    required
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <Form.Label className="text-secondary small fw-semibold mb-0">비밀번호</Form.Label>
                  <Link to="#" className="text-info text-decoration-none" style={{ fontSize: '0.75rem' }}>
                    비밀번호 재설정
                  </Link>
                </div>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-secondary text-secondary">
                    <FaLock size={14} />
                  </span>
                  <Form.Control
                    type="password"
                    placeholder="비밀번호 입력"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-black text-white border-secondary"
                    required
                  />
                </div>
              </Form.Group>

              <Button
                type="submit"
                variant="primary"
                className="w-100 py-2.5 rounded-pill fw-semibold shadow mb-3"
              >
                로그인
              </Button>
            </Form>

            {/* 구분선 */}
            <div className="position-relative text-center my-4">
              <hr className="border-secondary opacity-25" />
              <span 
                className="position-absolute top-50 start-50 translate-middle px-3 text-secondary"
                style={{ backgroundColor: '#11141f', fontSize: '0.72rem' }}
              >
                간편 로그인
              </span>
            </div>

            {/* 간편 소셜 로그인 */}
            <div className="d-flex flex-column gap-2 mb-4">
              <Button
                variant="outline-secondary"
                className="w-100 py-2 rounded-pill text-white border-secondary d-flex align-items-center justify-content-center gap-2"
                onClick={() => {
                  alert('Google 계정 연동 데모입니다.');
                  navigate('/');
                }}
              >
                <FcGoogle size={18} />
                <span className="small fw-semibold">Google로 계속하기</span>
              </Button>
              <Button
                variant="outline-secondary"
                className="w-100 py-2 rounded-pill text-white border-secondary d-flex align-items-center justify-content-center gap-2"
                onClick={() => {
                  alert('Apple 계정 연동 데모입니다.');
                  navigate('/');
                }}
              >
                <SiApple size={18} />
                <span className="small fw-semibold">Apple로 계속하기</span>
              </Button>
            </div>

            {/* 하단 가입 유도 */}
            <div className="text-center pt-2 border-top border-secondary border-opacity-25">
              <span className="text-secondary small">아직 계정이 없으신가요? </span>
              <Link to="#" className="text-primary fw-semibold small text-decoration-none">
                회원가입
              </Link>
            </div>
          </Card.Body>
        </Card>

        {/* 보안 안내 캡션 */}
        <div className="text-center mt-3 text-secondary d-flex justify-content-center align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
          <FaShieldAlt size={12} className="text-success" />
          <span>안전한 2단계 인증 및 암호화 통신 적용 중</span>
        </div>
      </Container>
    </div>
  );
}