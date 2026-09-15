import React, { useState } from "react";
import {
  Navbar,
  Container,
  Nav,
  Form,
  InputGroup,
  Button,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { FaMagic, FaSearch, FaBell, FaUserCircle } from "react-icons/fa";

export default function Navigation() {
  const navigate = useNavigate(); // 🔥 1. 네비게이트 함수 선언
  const [hasNewAlert, setHasNewAlert] = useState(true); // 새 알림 상태

  return (
    <Navbar
      bg="dark"
      variant="dark"
      sticky="top"
      className="py-2.5 border-bottom border-secondary"
      style={{ backgroundColor: "#0d0f17" }}
    >
      <Container fluid="lg">
        {/* 1. 로고 (왼쪽) */}
        <Navbar.Brand
          as={Link}
          to="/"
          className="fw-bold d-flex align-items-center gap-2 fs-5 me-4"
        >
          <span className="p-1.5 rounded bg-primary bg-opacity-25 text-primary d-inline-flex">
            <FaMagic size={16} />
          </span>
          <span style={{ letterSpacing: "-0.5px" }}>Weverse</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />

        <Navbar.Collapse id="navbar-nav">
          {/* 2. 네비게이션 메뉴 */}
          <Nav className="me-auto gap-lg-2">
            <Nav.Link as={Link} to="/" className="text-light fw-medium">
              Home
            </Nav.Link>
            <Nav.Link
              href="#popular-star"
              className="text-secondary hover-white"
            >
              Artists
            </Nav.Link>
            <Nav.Link href="#best-album" className="text-secondary hover-white">
              Albums
            </Nav.Link>
            <Nav.Link
              href="#ai-curation"
              className="text-secondary hover-white"
            >
              AI Curation
            </Nav.Link>
          </Nav>

          {/* 3. 오른쪽 끝 영역: [서치블록] - [새알림 종 아이콘] - [로그인] */}
          <div className="d-flex align-items-center gap-3 ms-auto mt-2 mt-lg-0">
            {/* 서치블록 (Search Input) */}
            <InputGroup style={{ width: "220px" }}>
              <InputGroup.Text className="bg-transparent border-secondary text-secondary ps-2.5 pe-2">
                <FaSearch size={13} />
              </InputGroup.Text>
              <Form.Control
                placeholder="아티스트, 굿즈 검색"
                className="bg-transparent border-secondary small shadow-none search-input-custom"
                style={{ fontSize: "0.82rem" }}
              />
            </InputGroup>

            {/* 새알림 종 아이콘 (Bell) */}
            <div className="position-relative">
              <Button
                variant="link"
                className="p-1 text-secondary hover-white position-relative"
                onClick={() => {
                  setHasNewAlert(false);
                  alert("[알림 피드]\n아티스트의 새로운 소식이 도착했습니다!");
                }}
                title="새 알림"
              >
                <FaBell size={18} className="text-light" />
                {hasNewAlert && (
                  <span
                    className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-dark rounded-circle"
                    style={{ width: "8px", height: "8px" }}
                  >
                    <span className="visually-hidden">새 알림</span>
                  </span>
                )}
              </Button>
            </div>

            {/* 🔥 2. 로그인 버튼: 클릭 시 로그인 페이지(/login)로 이동 */}
            <Button
              variant="outline-light"
              size="sm"
              className="rounded-pill px-3 py-1 d-flex align-items-center gap-1.5 border-secondary text-light fw-medium"
              style={{ fontSize: "0.82rem" }}
              onClick={() => navigate("/login")}
            >
              <FaUserCircle size={14} className="text-info" />
              <span>로그인</span>
            </Button>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
