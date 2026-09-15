// 1. React & Hooks
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// 2. UI Components (React Bootstrap)
import { Container, Badge, Button, Modal } from "react-bootstrap";

// 3. Icons (Font Awesome)
import {
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaRobot,
  FaMagic,
} from "react-icons/fa";

// 4. Local Data
import membersData from "../data/members.json";
import artistsData from "../data/artists.json";

// 💡 로컬 및 GitHub Pages 배포 환경 경로를 자동 보정하는 헬퍼 함수
const getAssetPath = (path) => {
  if (!path) return "";
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }
  const cleanPath = path.replace(/^\.?\//, "");
  return `${process.env.PUBLIC_URL}/${cleanPath}`;
};

export default function ArtistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. 아티스트 및 멤버 데이터 매칭
  const artistInfo = artistsData.find(
    (a) => a.id.toLowerCase() === id?.toLowerCase(),
  );
  const memberList = membersData[id] || membersData["seventeen"] || [];

  // 2. 인덱스 및 모달 상태
  const [activeIdx, setActiveIdx] = useState(0);
  const [showPromptModal, setShowPromptModal] = useState(false);

  // 3. n8n 실시간 멤버 뉴스 상태
  const [memberNews, setMemberNews] = useState(null);
  const [isNewsLoading, setIsNewsLoading] = useState(false);

  // 4. 무한 순환 네비게이션 핸들러 (방어 코드 포함)
  const handlePrev = () => {
    if (!memberList.length) return;
    setActiveIdx((prev) => (prev === 0 ? memberList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (!memberList.length) return;
    setActiveIdx((prev) => (prev === memberList.length - 1 ? 0 : prev + 1));
  };

  const currentMember = memberList[activeIdx] || {};

  // 5. 모달 오픈 시 n8n 호출
  useEffect(() => {
    if (showPromptModal && currentMember?.name) {
      setIsNewsLoading(true);
      setMemberNews(null);
      const targetArtist = artistInfo?.name || "세븐틴";
      const controller = new AbortController();

      fetch(
        `https://jmlee91.app.n8n.cloud/webhook/member-news?artist=${encodeURIComponent(targetArtist)}&member=${encodeURIComponent(currentMember.name)}&_t=${Date.now()}`,
      )
        .then((res) => {
          // 💡 HTTP 에러 처리 추가 (404, 500 등)
          if (!res.ok) throw new Error("서버 응답이 올바르지 않습니다.");
          return res.json();
        })
        .then((data) => {
          setMemberNews(data);
        })
        .catch((err) => {
          if (err.name === "AbortError") {
            console.log("요청이 취소되었습니다.");
          } else {
            console.error("멤버 소식 조회 실패:", err);
          }
        })
        .finally(() => {
          setIsNewsLoading(false);
        });
      return () => controller.abort();
    }
  }, [showPromptModal, currentMember, artistInfo?.name]);

  return (
    <div
      className="py-5 artist-detail-page"
      style={{
        minHeight: "100vh",
        backgroundColor: "#07080c",
        overflowX: "hidden",
      }}
    >
      <Container fluid="xl">
        {/* 상단 네비게이션 헤더 */}
        <div className="d-flex justify-content-between align-items-center mb-4 px-2">
          <Button
            variant="link"
            className="text-secondary text-decoration-none p-0 d-flex align-items-center gap-2"
            onClick={() => navigate("/")}
          >
            <FaArrowLeft size={14} /> 메인 피드로 돌아가기
          </Button>

          <Badge className="badge-ai px-3 py-1.5 rounded-pill">
            AI Persona Profiling
          </Badge>
        </div>

        {/* 아티스트 타이틀 섹션 */}
        <div className="text-center mb-5">
          <span
            className="text-primary text-uppercase fw-bold small tracking-wider"
            style={{ letterSpacing: "3px" }}
          >
            {artistInfo?.agency || "PLEDIS ENTERTAINMENT"}
          </span>
          <h1 className="display-5 fw-bold text-white mt-1">
            {artistInfo?.name || "SEVENTEEN"}
          </h1>
          <p className="text-secondary small mt-1">
            좌우 버튼을 눌러 원하는 멤버의 소식을 확인해 보세요.
          </p>
        </div>

        {/* 3D 서큘러 트랙 슬라이더 */}
        <div className="artist-circular-wrapper position-relative my-4">
          <button
            onClick={handlePrev}
            className="slider-nav-btn prev-btn"
            style={{ zIndex: 30 }}
            aria-label="Previous Member"
          >
            <FaChevronLeft size={18} />
          </button>
          <button
            onClick={handleNext}
            className="slider-nav-btn next-btn"
            style={{ zIndex: 30 }}
            aria-label="Next Member"
          >
            <FaChevronRight size={18} />
          </button>

          <div className="artist-circular-stage">
            {memberList.map((member, idx) => {
              let offset = idx - activeIdx;
              const total = memberList.length;
              if (offset > total / 2) offset -= total;
              if (offset < -total / 2) offset += total;

              const isCenter = offset === 0;

              let translateX = 0;
              if (offset === 0) {
                translateX = 0;
              } else if (offset > 0) {
                translateX = 340 + (offset - 1) * 135;
              } else {
                translateX = -340 + (offset + 1) * 135;
              }

              const isVisible = Math.abs(offset) <= 3;
              const memberBg = getAssetPath(member.image);

              return (
                <div
                  key={member.id || idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`artist-rotating-card ${
                    isCenter ? "card-center-active" : "card-side-pill"
                  }`}
                  style={{
                    transform: `translateX(${translateX}px) scale(${
                      isCenter ? 1 : 0.88 - Math.abs(offset) * 0.04
                    })`,
                    zIndex: isCenter ? 20 : 15 - Math.abs(offset),
                    opacity: !isVisible
                      ? 0
                      : isCenter
                        ? 1
                        : 0.55 - Math.abs(offset) * 0.1,
                    pointerEvents: isVisible ? "auto" : "none",
                    backgroundImage: `linear-gradient(to top, rgba(10, 11, 16, 0.95) 12%, rgba(10, 11, 16, 0.25) 60%, transparent 100%), url(${memberBg})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* 양옆 비활성화: 세로 라벨 */}
                  {!isCenter && (
                    <div className="side-pill-label">
                      <span className="text-white fw-bold">{member.name}</span>
                    </div>
                  )}

                  {/* 중앙 카드 상세 정보 */}
                  {isCenter && (
                    <div className="center-card-content p-4 p-md-5">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Badge bg="primary" className="px-3 py-1">
                          {member.role}
                        </Badge>
                        <span className="text-info small font-monospace">
                          {member.engName}
                        </span>
                      </div>

                      <h2 className="fw-bold text-white display-5 mb-2">
                        {member.name}
                      </h2>
                      <p
                        className="text-light text-opacity-85 small mb-4"
                        style={{ maxWidth: "440px", lineHeight: "1.7" }}
                      >
                        {member.desc}
                      </p>

                      <Button
                        variant="primary"
                        size="sm"
                        className="px-3 py-1.5 rounded-pill fw-semibold shadow-sm d-inline-flex align-items-center gap-2"
                        style={{ fontSize: "0.82rem" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowPromptModal(true);
                        }}
                      >
                        <FaRobot size={17} />
                        <span>AI Persona Chat</span>
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 하단 인디케이터 바 */}
        <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
          {memberList.map((_, idx) => (
            <div
              key={idx}
              onClick={() => setActiveIdx(idx)}
              style={{
                width: idx === activeIdx ? "36px" : "8px",
                height: "6px",
                borderRadius: "4px",
                backgroundColor:
                  idx === activeIdx ? "#38bdf8" : "rgba(255, 255, 255, 0.2)",
                cursor: "pointer",
                transition: "all 0.35s ease",
              }}
            />
          ))}
        </div>
      </Container>

      {/* 1. 실시간 멤버 뉴스 브리핑 모달 */}
      <Modal
        show={showPromptModal}
        onHide={() => setShowPromptModal(false)}
        centered
      >
        <div
          className="p-4 p-sm-5 text-center"
          style={{
            backgroundColor: "#111420",
            borderRadius: "24px",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.9)",
          }}
        >
          <div
            className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle"
            style={{
              width: "64px",
              height: "64px",
              background: "rgba(56, 189, 248, 0.15)",
              color: "#38bdf8",
              border: "1px solid rgba(56, 189, 248, 0.3)",
            }}
          >
            <FaMagic size={24} />
          </div>

          <h4 className="fw-bold text-white mb-2">
            [{currentMember.name || "아티스트"}] AI 프롬프트 엔진
          </h4>
          <Badge bg="secondary" className="mb-3 px-3 py-1">
            Prompt Tuning in Progress
          </Badge>

          {/* n8n 실시간 AI 브리핑 영역 */}
          <div className="my-3 text-start">
            {isNewsLoading ? (
              <div className="text-center py-4">
                <div
                  className="spinner-border text-primary spinner-border-sm mb-2"
                  role="status"
                />
                <p className="text-secondary small mb-0">
                  <strong>{currentMember.name || "멤버"}</strong> 님의 최신 활동
                  뉴스를 수집하고 AI로 분석 중입니다...
                </p>
              </div>
            ) : memberNews && memberNews.headline ? (
              <div className="bg-light p-3 rounded-3 border">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-primary px-2 py-1">
                    {memberNews.activity_tag || "최근 활동"}
                  </span>
                  <small className="text-muted">실시간 뉴스 브리핑</small>
                </div>

                <h6
                  className="fw-bold text-dark mb-2"
                  style={{ lineHeight: "1.4" }}
                >
                  {memberNews.headline}
                </h6>

                <p
                  className="text-secondary small mb-3"
                  style={{ lineHeight: "1.6" }}
                >
                  {memberNews.summary}
                </p>

                {memberNews.fan_cheer && (
                  <div className="p-2 rounded bg-white border-start border-primary border-3 small text-muted fst-italic">
                    "{memberNews.fan_cheer}"
                  </div>
                )}
              </div>
            ) : (
              <p
                className="text-secondary small mb-4"
                style={{ lineHeight: "1.7" }}
              >
                최신 활동 뉴스를 불러오지 못했습니다. 잠시 후 다시 시도해
                주세요.
              </p>
            )}
          </div>

          <Button
            variant="primary"
            className="w-100 py-2.5 rounded-pill fw-semibold shadow"
            onClick={() => setShowPromptModal(false)}
          >
            확인
          </Button>
        </div>
      </Modal>
    </div>
  );
}
