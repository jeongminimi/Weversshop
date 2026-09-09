import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Badge, Button, Modal } from "react-bootstrap";
import {
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
  FaRobot,
  FaMagic,
} from "react-icons/fa";
import membersData from "../data/members.json";
import artistsData from "../data/artists.json";

export default function ArtistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. 아티스트 및 멤버 목록 로드
  const artistInfo = artistsData.find(
    (a) => a.id.toLowerCase() === id?.toLowerCase(),
  );
  const memberList = membersData[id] || membersData["seventeen"] || [];

  // 🔥 [핵심 1] 첫 번째 멤버(Index 0)부터 시작
  const [activeIdx, setActiveIdx] = useState(0);
  const [showPromptModal, setShowPromptModal] = useState(false);

  // 🔥 [핵심 2] 무한 순환 이전 / 다음 핸들러 (Circular Navigation)
  const handlePrev = () => {
    setActiveIdx((prev) => (prev === 0 ? memberList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIdx((prev) => (prev === memberList.length - 1 ? 0 : prev + 1));
  };

  const currentMember = memberList[activeIdx] || {};

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
            좌우 버튼을 눌러 원하는 맴버의 소식을 확인해 보세요.
          </p>
        </div>

        {/* =========================================================================
            🔥 3D 무한 순환 서큘러 트랙 (Popular this week 순환 로직 적용)
            ========================================================================= */}
        <div className="artist-circular-wrapper position-relative my-4">
          {/* 좌우 이동 버튼 */}
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

          {/* 원형 트랙 컨테이너 */}
          <div className="artist-circular-stage">
            {memberList.map((member, idx) => {
              // 메인의 offset 순환 공식 적용
              let offset = idx - activeIdx;
              const total = memberList.length;
              if (offset > total / 2) offset -= total;
              if (offset < -total / 2) offset += total;

              const isCenter = offset === 0;

              // 중앙 카드(폭 520px)와 양옆 알약 카드(폭 110px) 간의 동적 X좌표 계산
              let translateX = 0;
              if (offset === 0) {
                translateX = 0;
              } else if (offset > 0) {
                translateX = 340 + (offset - 1) * 135;
              } else {
                translateX = -340 + (offset + 1) * 135;
              }

              // 중앙 기준 좌우 3개까지만 화면에 노출 (성능 및 시각적 정돈)
              const isVisible = Math.abs(offset) <= 3;

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
                    backgroundImage: `linear-gradient(to top, rgba(10, 11, 16, 0.95) 12%, rgba(10, 11, 16, 0.25) 60%, transparent 100%), url(${member.image})`,
                  }}
                >
                  {/* 양옆 비활성화 상태: 세로 텍스트 라벨 (레퍼런스 이미지 스타일) */}
                  {!isCenter && (
                    <div className="side-pill-label">
                      <span className="text-white fw-bold">{member.name}</span>
                    </div>
                  )}

                  {/* 중앙 활성화 상태: 대형 와이드 카드 상세 정보 */}
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

                      {/* AI 프롬프트 창 오픈 버튼 */}
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

        {/* 하단 멤버 인디케이터 (13개 점) */}
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

      {/* =========================================================================
          🔥 AI 프롬프트 창 (서비스 준비 중 팝업 모달)
          ========================================================================= */}
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
            [{currentMember.name}] AI 프롬프트 엔진
          </h4>
          <Badge bg="secondary" className="mb-3 px-3 py-1">
            Prompt Tuning in Progress
          </Badge>

          <p
            className="text-secondary small mb-4"
            style={{ lineHeight: "1.7" }}
          >
            현재 <strong>{currentMember.name}</strong> 님의 고유 어투와 영상
            인터뷰 데이터를 학습한 n8n AI 에이전트 파이프라인을 구축하고
            있습니다.
            <br />
            실시간 질의응답 및 페르소나 대화 서비스는 곧 제공될 예정입니다!
          </p>

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
