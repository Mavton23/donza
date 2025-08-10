import { memo, useRef, useEffect, useCallback } from 'react';
import DebateMessageItem from './DebateMessageItem';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList as List } from 'react-window';

const DebateMessageList = memo(({ 
  messages, 
  currentUserId,
  onEditMessage,
  onDeleteMessage,
  onMessageRead,
  hasMore,
  loadMore,
  isLoading
}) => {
  const listRef = useRef();
  const loaderRef = useRef();
  const rowHeights = useRef({});
  const loadingRef = useRef(false);

  const getEstimatedItemSize = useCallback((message) => {
    if (message.metadata?.file) return 220;
    if (message.content.length > 100) return 150;
    return 90;
  }, []);

  const setRowHeight = useCallback((index, size) => {
    if (rowHeights.current[index] !== size) {
      rowHeights.current[index] = size;
      listRef.current?.resetAfterIndex(index);
    }
  }, []);

  const getItemSize = useCallback((index) => {
    return rowHeights.current[index] || getEstimatedItemSize(messages[index]);
  }, [messages, getEstimatedItemSize]);

  const handleItemsRendered = useCallback(({ visibleStartIndex, visibleStopIndex }) => {
    if (!hasMore || isLoading || loadingRef.current) return;
    
    // Verifica se estamos perto do final
    if (visibleStopIndex >= messages.length - 5) {
      loadingRef.current = true;
      loadMore().finally(() => {
        loadingRef.current = false;
      });
    }
  }, [hasMore, isLoading, loadMore, messages.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading && !loadingRef.current) {
          loadingRef.current = true;
          loadMore().finally(() => {
            loadingRef.current = false;
          });
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, isLoading, loadMore]);

  return (
    <div className="h-full">
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            itemCount={messages.length + (hasMore ? 1 : 0)}
            itemSize={getItemSize}
            width={width}
            ref={listRef}
            estimatedItemSize={100}
            onItemsRendered={handleItemsRendered}
          >
            {({ index, style }) => {
              if (index === messages.length && hasMore) {
                return (
                  <div ref={loaderRef} style={style} className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                );
              }
              
              const message = messages[index];
              return (
                <div style={style}>
                  <DebateMessageItem
                    message={message}
                    currentUserId={currentUserId}
                    onEdit={onEditMessage}
                    onDelete={onDeleteMessage}
                    onRead={onMessageRead}
                    onSizeMeasured={(size) => setRowHeight(index, size)}
                  />
                </div>
              );
            }}
          </List>
        )}
      </AutoSizer>
    </div>
  );
});

DebateMessageList.displayName = 'DebateMessageList';
export default DebateMessageList;