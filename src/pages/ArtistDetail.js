import React from 'react';
import { Container, Card, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import curationList from '../data/seventeen_curation.json';
import { FaQuoteLeft, FaExternalLinkAlt, FaHeadphones, FaArrowLeft } from 'react-icons/fa';

export default function ArtistDetail() {
  return (
    <Container className="py-5" style={{ maxWidth: '850px' }}>
      <Link to="/" className="text-secondary text-decoration-none d-inline-flex align-items-center mb-4">
        <FaArrowLeft className="me-2" /> 전체 아티스트 목록으로 돌아가기
      </Link>

      <div className="mb-5 pb-3 border-bottom border-secondary">
        <Badge bg="danger" className="mb-2">CARAT Dedicated Feed</Badge>
        <h1 className="fw-bold text-white">세븐틴 (SEVENTEEN) 맥락 기반 큐레이션</h1>
        <p className="text-secondary">
          스타디움 콘서트 비하인드와 라이브 영상에서 n8n AI 파이프라인으로 추출된 인과관계 추천입니다.
        </p>
      </div>

      <div className="d-flex flex-column gap-4">
        {curationList.map((item) => (
          <Card key={item.id} bg="dark" text="white" className="border-secondary shadow">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Badge bg="primary">{item.category_badge}</Badge>
                <small className="text-secondary">{item.source}</small>
              </div>

              <h4 className="fw-bold mb-3">{item.headline}</h4>

              {/* 아티스트 발언 인용구 */}
              <div className="p-3 bg-black rounded border border-secondary mb-4 d-flex gap-3">
                <FaQuoteLeft className="text-info fs-4 flex-shrink-0 mt-1" />
                <p className="mb-0 text-light fst-italic">{item.quote}</p>
              </div>

              {/* 추천 굿즈 / 아이템 */}
              <div className="p-3 rounded border border-secondary bg-black d-flex flex-column flex-sm-row align-items-center gap-3 mb-3">
                <img 
                  src={item.product.img} 
                  alt={item.product.name} 
                  className="rounded"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
                <div className="flex-grow-1 text-center text-sm-start">
                  <Badge bg="secondary" className="mb-1">{item.product.tag}</Badge>
                  <h5 className="fw-bold mb-1">{item.product.name}</h5>
                  <p className="small text-secondary mb-0">{item.product.reason}</p>
                </div>
                <Button 
                  href={item.product.link} 
                  target="_blank" 
                  variant="outline-info" 
                  size="sm"
                  className="d-flex align-items-center gap-1"
                >
                  보러가기 <FaExternalLinkAlt size={12} />
                </Button>
              </div>

              {/* 예습 플레이리스트 등 부가 추천 */}
              {item.sub_feature && (
                <div className="d-flex justify-content-between align-items-center pt-2 px-1 text-secondary small">
                  <div className="d-flex align-items-center gap-2 text-warning">
                    <FaHeadphones />
                    <span><strong>{item.sub_feature.type}:</strong> {item.sub_feature.title}</span>
                  </div>
                  <a href={item.sub_feature.link} target="_blank" rel="noreferrer" className="text-info text-decoration-none">
                    바로 듣기
                  </a>
                </div>
              )}
            </Card.Body>
          </Card>
        ))}
      </div>
    </Container>
  );
}