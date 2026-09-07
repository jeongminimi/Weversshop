import React from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';

export default function PipelineModal({ show, onHide }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-dark text-white border-secondary">
        <Modal.Title className="fs-5">
          <Badge bg="warning" text="dark" className="me-2">Behind The Scene</Badge>
          n8n AI Context Curation Pipeline
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-light">
        <h6 className="text-info fw-bold mb-3">데이터 수집 및 정제 아키텍처</h6>
        <div className="p-3 mb-3 rounded bg-black border border-secondary font-monospace" style={{ fontSize: '0.85rem' }}>
          [Trigger: 유튜브 자막 / 위버스 라이브 / 공식 공지] <br />
          &nbsp;&nbsp;↓ <br />
          [n8n Workflow: 전처리 및 텍스트 청킹] <br />
          &nbsp;&nbsp;↓ <br />
          [LLM Agent: 사건, 아티스트 발언, 아이템 간 인과관계 추출] <br />
          &nbsp;&nbsp;↓ <br />
          [JSON Schema Validation: Strict Output 매핑] <br />
          &nbsp;&nbsp;↓ <br />
          [React Frontend: Context Card 렌더링]
        </div>
        <p className="text-secondary small mb-0">
          단순 상품 나열을 넘어, 아티스트의 실제 라이프사이클과 팬의 니즈를 인과관계로 연결하여 큐레이션합니다.
        </p>
      </Modal.Body>
      <Modal.Footer className="bg-dark border-secondary">
        <Button variant="secondary" size="sm" onClick={onHide}>닫기</Button>
      </Modal.Footer>
    </Modal>
  );
}