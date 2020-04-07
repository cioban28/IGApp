import React from 'react';
import Card from './Cards/ChannelCard';
import CampaignCard from './Cards/CampaignCard';

export const ChannelCardDragPreview = (props) => {
	const styles = {
		display: 'inline-block',
		width: `${props.card.clientWidth || 243}px`,
		height: `${props.card.clientHeight || 243}px`,
	};

  return (
    <div style={styles}>
      <Card item={props.card.item} draggingPreview />
    </div>
  );
};

export const CampaignCardDragPreview = (props) => {
	const styles = {
		display: 'inline-block',
		width: `${props.card.clientWidth || 243}px`,
		height: `${props.card.clientHeight || 243}px`,
	};

	return (
    <div style={styles}>
      <CampaignCard item={props.card.item} draggingPreview />
    </div>
	);
};