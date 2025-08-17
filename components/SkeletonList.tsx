import React from 'react';
import styled from 'styled-components/native';
import Skeleton from './Skeleton';

const SkeletonListContainer = styled.View`
  flex: 1;
  width: 100%;
`;

const SkeletonItem = styled.View`
  
`;

interface SkeletonListProps {
  count?: number;
}

export default function SkeletonList({ count = 4 }: SkeletonListProps) {
  const skeletons = Array.from({ length: count }, (_, index) => (
    <SkeletonItem key={index}>
      <Skeleton />
    </SkeletonItem>
  ));

  return (
    <SkeletonListContainer>
      {skeletons}
    </SkeletonListContainer>
  );
}