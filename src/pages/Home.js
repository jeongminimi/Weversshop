import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Carousel,
  Badge,
  Button,
  Spinner,
  Modal,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
// src/pages/Home.js 상단
import {
  FaBroadcastTower,
  FaCommentDots,
  FaCalendarAlt,
  FaPlayCircle,
  FaMagic,
  FaCrown,
  FaTicketAlt,
  FaCompactDisc,
  FaLightbulb,
  FaArrowRight,
  FaLock,
  FaQuoteLeft,
  FaFire,
  FaExternalLinkAlt,
  FaSyncAlt,
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
} from "react-icons/fa";
import artistsData from "../data/artists.json";
import fallbackCurationData from "../data/seventeen_curation.json";
import bestAlbums from "../data/best_albums.json";
import sliderItems from "../data/slider_items.json";

export default function Home() {
  // 1. 퀵메뉴 버튼 상태 옵션
  const [showReadyModal, setShowReadyModal] = useState(false);
  const [selectedMenuName, setSelectedMenuName] = useState("");

  const navigate = useNavigate();

  // 2. POPULAR STAR 중앙 슬라이더 상태
  const [activeStarIdx, setActiveStarIdx] = useState(0);

  const handlePrevStar = () => {
    setActiveStarIdx((prev) =>
      prev === 0 ? artistsData.length - 1 : prev - 1,
    );
  };

  const handleNextStar = () => {
    setActiveStarIdx((prev) =>
      prev === artistsData.length - 1 ? 0 : prev + 1,
    );
  };

  // 2. n8n Git 연동 데이터 상태
  const [curationItems, setCurationItems] = useState(fallbackCurationData);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(
    "2026-09-04 16:30 (자동 동기화됨)",
  );

  const GITHUB_RAW_JSON_URL = "";

  const fetchLatestGitData = async () => {
    if (!GITHUB_RAW_JSON_URL) return;
    try {
      setIsLoading(true);
      const res = await fetch(GITHUB_RAW_JSON_URL + `?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        setCurationItems(data);
        setLastSyncTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.warn("Git 데이터 페치 실패, 기본 데이터를 유지합니다.", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestGitData();
  }, []);

  // 2. 팬 소통 커뮤니티 퀵 메뉴 목록 (6개)
  const quickMenus = [
    {
      icon: <FaBroadcastTower size={22} className="text-danger" />,
      label: "LIVE 방송",
      link: "#",
    },
    {
      icon: <FaCommentDots size={22} className="text-info" />,
      label: "아티스트 피드",
      link: "#",
    },
    {
      icon: <FaCalendarAlt size={22} className="text-warning" />,
      label: "공식 스케줄",
      link: "#",
    },
    {
      icon: <FaPlayCircle size={22} className="text-success" />,
      label: "미디어 콘텐츠",
      link: "#",
    },
    {
      icon: <FaMagic size={22} className="text-primary" />,
      label: "AI 큐레이션",
      link: "#ai-curation",
    },
    {
      icon: <FaCrown size={22} style={{ color: "#eab308" }} />,
      label: "멤버십 전용",
      link: "/login", // 🔥 로그인 서브페이지로 연결
    },
  ];

// 3. 중간 자동 슬라이딩 프로모션 배너 데이터
  const promoBanners = [
    {
      id: 1,
      badge: "EVENT",
      badgeColor: "danger",
      title: "SEVENTEEN 11th Mini Album 컴백 기념 공식 팬사인회 응모",
      desc: "위버스 단독 미공개 포토카드 증정 및 실시간 럭키드로우 진행 중",
      bgGradient: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)",
      btnText: "응모하기",
      link: "/login",
    },
    {
      id: 2,
      badge: "MEMBERSHIP ONLY",
      badgeColor: "warning",
      title: "2026 GLOBAL CARAT 공식 멤버십 선예매 라운지 오픈",
      desc: "월드 투어 앙코르 서울 콘서트 티켓팅 선예매 인증 및 독점 비하인드 혜택",
      bgGradient: "linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)",
      btnText: "멤버십 인증",
      link: "/login",
    },
    {
      id: 3,
      badge: "AI UPDATE",
      badgeColor: "info",
      title: "n8n AI 콘서트 직캠 기반 실시간 착장 & MD 자동 매핑 2.0",
      desc: "공연 영상 속 멤버들이 실제 착용한 아이템과 무대 소품을 AI가 분석 추천합니다.",
      bgGradient: "linear-gradient(135deg, #064e3b 0%, #0f172a 100%)",
      btnText: "AI 큐레이션",
      link: "#ai-curation",
    },
  ];








  return (
    <div className="pb-5">
      {/* =========================================================================
          1. HERO SLIDER (독립 너비 컨테이너: CSS의 max-width로 단독 제어)
          ========================================================================= */}
      <section className="hero-slider-container pt-3 mb-5">
        <div className="hero-slider-wrapper shadow-lg">
          <Carousel interval={4500}>
            {sliderItems.map((slide) => (
              <Carousel.Item key={slide.id} className="hero-slider-item">
                <div
                  className="hero-slide-content"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="hero-slide-overlay" />
                  <div className="hero-slide-text px-4 px-md-5">
                    <Badge className="badge-ai px-3 py-1 mb-3 rounded-pill">
                      AI Context Highlight
                    </Badge>
                    <h1 className="fw-bold text-white display-6 mb-2">
                      {slide.title}
                    </h1>
                    <h5 className="text-info mb-3">{slide.subtitle}</h5>
                    <p className="text-secondary small mb-4">{slide.desc}</p>
                    <Button
                      variant="primary"
                      className="px-4 py-2 rounded-pill fw-semibold shadow"
                      onClick={() => navigate(`/artist/${slide.artistId}`)}
                    >
                      큐레이션 피드 보기 <FaArrowRight className="ms-2" />
                    </Button>
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      </section>

      {/* =========================================================================
          MAIN CONTENTS (기본 규격 컨테이너: 퀵메뉴, 인기스타, 앨범샵, AI큐레이션)
          ========================================================================= */}
      <Container>
        {/* -----------------------------------------------------------------------
            2. QUICK ICONS (팬 커뮤니티 6대 퀵 메뉴)
            ----------------------------------------------------------------------- */}
        <div className="mb-5 py-2">
          <div className="quick-menu-grid">
            {quickMenus.map((item, idx) => (
              <div
                key={idx}
                className="quick-circle-item"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  if (item.label === "AI 큐레이션") {
                    // 1. AI 큐레이션: 해당 섹션으로 부드럽게 스크롤
                    const target = document.querySelector(item.link);
                    if (target) target.scrollIntoView({ behavior: "smooth" });
                  } else if (item.label === "멤버십 전용") {
                    // 2. 멤버십 전용: 로그인 서브페이지(/login)로 이동
                    navigate(item.link);
                  } else {
                    // 3. LIVE, 아티스트 피드, 공식 스케줄, 미디어 콘텐츠: 준비 중 경고창
                    alert(`[${item.label}] 현재 서비스 준비 중입니다.`);
                  }
                }}
              >
                <div className="quick-circle-btn">{item.icon}</div>
                <span className="quick-circle-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* -----------------------------------------------------------------------
            3. SECTION 1: POPULAR STAR (3D 인터랙티브 카드 슬라이더)
            ----------------------------------------------------------------------- */}
        <section id="popular-star" className="mb-5 pt-4 position-relative">
          <div className="text-center mb-5">
            <span
              className="text-primary text-uppercase fw-bold small tracking-wider"
              style={{ letterSpacing: "2px" }}
            >
              Trending Artists
            </span>
            <h2
              className="fw-bold text-white display-6 mt-1"
              style={{ letterSpacing: "-0.5px" }}
            >
              Popular this week
            </h2>
            <p className="text-secondary small mt-1">
              카드를 클릭하거나 좌우 버튼으로 아티스트별 AI 큐레이션을
              탐색해보세요.
            </p>
          </div>

          <button
            onClick={handlePrevStar}
            className="slider-nav-btn prev-btn"
            aria-label="Previous Star"
          >
            <FaChevronLeft size={16} />
          </button>
          <button
            onClick={handleNextStar}
            className="slider-nav-btn next-btn"
            aria-label="Next Star"
          >
            <FaChevronRight size={16} />
          </button>

          <div className="star-carousel-container">
            <div className="star-carousel-track">
              {artistsData.map((artist, idx) => {
                let offset = idx - activeStarIdx;
                const total = artistsData.length;
                if (offset > total / 2) offset -= total;
                if (offset < -total / 2) offset += total;

                const isCenter = offset === 0;

                return (
                  <div
                    key={artist.id}
                    onClick={() => {
                      if (isCenter) {
                        if (artist.active) navigate(`/artist/${artist.id}`);
                        else
                          alert(
                            `[${artist.name}] 데이터 파이프라인 수집 준비 중입니다.`,
                          );
                      } else {
                        setActiveStarIdx(idx);
                      }
                    }}
                    className={`star-slide-card ${isCenter ? "card-center" : "card-side"}`}
                    style={{
                      transform: `translateX(${offset * 300}px) scale(${isCenter ? 1.15 : 0.85})`,
                      zIndex: isCenter ? 10 : 5 - Math.abs(offset),
                      opacity: Math.abs(offset) > 2 ? 0 : isCenter ? 1 : 0.55,
                      pointerEvents: Math.abs(offset) > 2 ? "none" : "auto",
                    }}
                  >
                    <div className="star-card-image-wrap">
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="star-card-img"
                      />
                      <div className="star-card-glow" />
                      {!artist.active && (
                        <div className="position-absolute top-0 end-0 m-3 px-2 py-1 rounded bg-black bg-opacity-75 text-secondary small d-flex align-items-center gap-1">
                          <FaLock size={11} /> <span>준비 중</span>
                        </div>
                      )}
                    </div>

                    <div className="star-card-info">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div>
                          <h5
                            className="fw-bold text-white mb-0 text-truncate"
                            style={{ maxWidth: "140px" }}
                          >
                            {artist.name}
                          </h5>
                          <span
                            className="text-info small"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {artist.agency}
                          </span>
                        </div>
                        <Badge
                          bg={artist.active ? "primary" : "secondary"}
                          className="px-2 py-1 small"
                        >
                          {artist.active ? "Curation" : "Standby"}
                        </Badge>
                      </div>

                      <div className="d-flex justify-content-between align-items-center pt-2 mt-2 border-top border-secondary border-opacity-50">
                        <span className="text-light small font-monospace">
                          {artist.fandom}
                        </span>
                        <div className="d-flex align-items-center gap-1 text-danger small">
                          <FaHeart size={12} />
                          <span
                            className="text-secondary"
                            style={{ fontSize: "0.75rem" }}
                          >
                            {isCenter ? "50k" : "39k"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>





{/* -----------------------------------------------------------------------
            3.5. MID PROMO BANNER (자동 슬라이딩 중간 프로모션 띠배너)
            ----------------------------------------------------------------------- */}
        <div className="my-5">
          <Carousel
            interval={3500}
            indicators={true}
            controls={false}
            pause="hover"
            className="mid-promo-carousel shadow-lg"
          >
            {promoBanners.map((promo) => (
              <Carousel.Item key={promo.id}>
                <div
                  className="mid-promo-card px-4 py-3 py-md-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3"
                  style={{ background: promo.bgGradient }}
                  onClick={() => {
                    if (promo.link.startsWith("#")) {
                      const target = document.querySelector(promo.link);
                      if (target) target.scrollIntoView({ behavior: "smooth" });
                    } else {
                      navigate(promo.link);
                    }
                  }}
                >
                  <div className="d-flex flex-column gap-1">
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg={promo.badgeColor} className="px-2.5 py-1 text-uppercase fw-bold" style={{ fontSize: "0.7rem" }}>
                        {promo.badge}
                      </Badge>
                      <span className="text-secondary small font-monospace">ContextVerse Notice</span>
                    </div>
                    <h5 className="fw-bold text-white mb-0 mt-1">{promo.title}</h5>
                    <p className="text-light text-opacity-75 small mb-0">{promo.desc}</p>
                  </div>

                  <div className="flex-shrink-0">
                    <Button
                      variant="outline-light"
                      size="sm"
                      className="rounded-pill px-4 py-2 fw-semibold border-secondary shadow-sm d-flex align-items-center gap-2"
                    >
                      {promo.btnText} <FaArrowRight size={11} />
                    </Button>
                  </div>
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        </div>






        {/* -----------------------------------------------------------------------
            4. SECTION 2: BEST ALBUM (위버스샵 4x2 커머스 그리드)
            ----------------------------------------------------------------------- */}
        <section id="best-album" className="mb-5 pt-4">
          <div className="text-center mb-5">
            <span
              className="text-primary text-uppercase fw-bold small"
              style={{ letterSpacing: "2px" }}
            >
              Official Discography Shop
            </span>
            <h2 className="fw-bold text-white display-6 mt-1">
              Explore Best Albums
            </h2>
            <p className="text-secondary small mt-1">
              앨범 카드를 클릭하면 위버스샵 판매 상세 페이지로 바로 연결됩니다.
            </p>
          </div>

          <Row xs={1} sm={2} lg={4} className="g-4">
            {bestAlbums.map((album) => (
              <Col key={album.id}>
                <div
                  className="album-collage-card"
                  onClick={() => navigate(`/album/${album.id}`)}
                  title="클릭하여 상세 페이지로 이동"
                >
                  {/* 상단 3분할 썸네일 */}
                  <div className="collage-thumbs">
                    {album.thumbs.map((thumb, idx) => (
                      <img
                        key={idx}
                        src={thumb}
                        alt={`${album.title} preview ${idx + 1}`}
                        className="collage-thumb-img"
                      />
                    ))}
                  </div>

                  {/* 하단 단일 와이드 배너 */}
                  <img
                    src={album.banner}
                    alt={`${album.title} banner`}
                    className="collage-banner-img"
                  />

{/* 하단 위버스샵 상품 정보 영역 */}
                  <div className="album-shop-body mt-2 pt-2">
                    <div
                      className="album-shop-title text-light fw-medium text-truncate mb-1"
                      title={album.title}
                    >
                      {album.title}
                    </div>

                    <div className="d-flex align-items-baseline gap-1">
                      <span className="text-secondary" style={{ fontSize: "0.72rem" }}>
                        KRW
                      </span>
                      <span className="fw-bold text-white fs-6">
                        ₩{album.price}
                      </span>
                    </div>

                    <div className="text-secondary mb-2" style={{ fontSize: "0.7rem" }}>
                      세금포함
                    </div>

                    <div className="d-flex align-items-center gap-1.5">
                      {album.badges.map((badge, bIdx) => (
                        <span
                          key={bIdx}
                          className={
                            badge === "PICKUP"
                              ? "weverse-tag-pickup"
                              : "weverse-tag-benefit"
                          }
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </section>

        {/* -----------------------------------------------------------------------
            5. SECTION 3: AI 추천 굿즈 (n8n Git Pipeline 연동)
            ----------------------------------------------------------------------- */}
        <section id="ai-curation" className="mb-5 pt-4">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4 gap-2">
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <FaFire className="text-danger" />
                <span className="text-primary text-uppercase fw-bold small">
                  Context-Driven Automated MD
                </span>
              </div>
              <h2 className="fw-bold text-white mb-0">AI 추천 굿즈</h2>
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className="text-secondary small">
                마지막 자동 수집:{" "}
                <strong className="text-light">{lastSyncTime}</strong>
              </span>
              <Button
                variant="outline-secondary"
                size="sm"
                className="rounded-circle p-2 text-info border-secondary"
                onClick={fetchLatestGitData}
                title="Git 최신 데이터 새로고침"
              >
                <FaSyncAlt size={12} className={isLoading ? "fa-spin" : ""} />
              </Button>
              <Button
                variant="link"
                className="text-primary text-decoration-none small p-0"
                onClick={() => navigate("/artist/seventeen")}
              >
                전체 맥락 보기 &gt;
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="text-secondary small mt-2">
                n8n에서 정제된 최신 굿즈 큐레이션을 불러오는 중...
              </p>
            </div>
          ) : (
            <Row xs={1} md={2} className="g-4">
              {curationItems.map((item) => (
                <Col key={item.id}>
                  <div className="glow-card p-4 h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <Badge className="badge-ai px-2.5 py-1">
                          {item.category_badge}
                        </Badge>
                        <small className="text-secondary">{item.source}</small>
                      </div>

                      <h5 className="fw-bold text-white mt-3 mb-3">
                        {item.headline}
                      </h5>

                      <div className="p-3 bg-black rounded border border-secondary mb-3 d-flex gap-2">
                        <FaQuoteLeft className="text-info fs-5 flex-shrink-0 mt-1" />
                        <p className="mb-0 text-light small fst-italic">
                          "{item.quote}"
                        </p>
                      </div>

                      <div className="p-3 bg-black rounded border border-secondary d-flex align-items-center gap-3">
                        <img
                          src={item.product?.img}
                          alt={item.product?.name}
                          className="rounded"
                          style={{
                            width: "70px",
                            height: "70px",
                            objectFit: "cover",
                          }}
                        />
                        <div className="flex-grow-1">
                          <Badge bg="secondary" className="small mb-1">
                            {item.product?.tag}
                          </Badge>
                          <h6 className="fw-bold text-white mb-1">
                            {item.product?.name}
                          </h6>
                          <p className="text-secondary small mb-0">
                            {item.product?.reason}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-top border-secondary d-flex justify-content-between align-items-center">
                      <span
                        className="text-secondary small"
                        style={{ fontSize: "0.75rem" }}
                      >
                        ● n8n Git Commit 연동 완료
                      </span>
                      <Button
                        href={item.product?.link}
                        target="_blank"
                        variant="outline-info"
                        size="sm"
                        className="rounded-pill d-flex align-items-center gap-1"
                      >
                        위버스샵 구매 <FaExternalLinkAlt size={11} />
                      </Button>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          )}
        </section>
      </Container>

      {/* =========================================================================
          6. FOOTER
          ========================================================================= */}
      <footer
        className="mt-5 py-4 border-top border-secondary"
        style={{ backgroundColor: "#090a0e" }}
      >
        <Container className="text-center text-secondary small">
          <p className="mb-1 fw-semibold text-light">
            ContextVerse / WeverseAI Marketplace Portfolio
          </p>
          <p className="mb-2">
            Powered by React, Bootstrap & n8n AI Automated Context Pipeline
          </p>
          <p className="text-muted" style={{ fontSize: "0.75rem" }}>
            본 사이트는 포트폴리오 및 AI 파이프라인 검증용 데모 프로젝트입니다.
          </p>
        </Container>
      </footer>
    </div>
  );
}
