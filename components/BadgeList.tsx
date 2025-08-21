import React from 'react';
import styled from 'styled-components/native';
import { useTranslation } from 'react-i18next';

const BadgeListContainer = styled.ScrollView`
  flex-direction: row;
  width: 100%;
  padding-vertical: 12px;
  background-color: #ffffff;
  flex-grow: 0;
  padding-horizontal: 16px;
`;

const BadgeItem = styled.TouchableOpacity<{ isSelected: boolean }>`
  padding: 8px 16px;
  margin-right: 12px;
  border-radius: 20px;
  background-color: ${props => props.isSelected ? '#000000' : '#f0f0f0'};
  border-width: 1px;
  border-color: ${props => props.isSelected ? '#000000' : '#ffffff'};
  height: 40px;
  align-self: flex-start;
  justify-content: center;
`;

const BadgeText = styled.Text<{ isSelected: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.isSelected ? '#ffffff' : '#333333'};
  text-align: center;
`;

interface BadgeListProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export default function BadgeList({ selectedCategory, onCategorySelect }: BadgeListProps) {
  const { t } = useTranslation();

  const categories = [
    { key: 'all', translationKey: 'all' },
    { key: 'technology', translationKey: 'technology' },
    { key: 'sports', translationKey: 'sports' },
    { key: 'politics', translationKey: 'politics' }
  ];

  return (
    <BadgeListContainer 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingRight: 16 }}
    >
      {categories.map((category) => (
        <BadgeItem
          key={category.key}
          isSelected={selectedCategory === category.key}
          onPress={() => onCategorySelect(category.key)}
          activeOpacity={0.7}
        >
          <BadgeText isSelected={selectedCategory === category.key}>
            {t(category.translationKey)}
          </BadgeText>
        </BadgeItem>
      ))}
    </BadgeListContainer>
  );
}