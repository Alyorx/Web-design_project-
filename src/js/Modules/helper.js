export function mergeItems(existingItems, incomingItems, idKey = 'id') {
  const merged = [...existingItems];
  const existingMap = new Map(existingItems.map(item => [item[idKey], item]));

  incomingItems.forEach(incoming => {
    const existing = existingMap.get(incoming[idKey]);
    if (!existing) {
      // New item, add it
      merged.push(incoming);
    } else {
      // Existing item, update keys that have changed
      Object.keys(incoming).forEach(key => {
        // Update only if different
        if (JSON.stringify(existing[key]) !== JSON.stringify(incoming[key])) {
          existing[key] = incoming[key];
        }
      });
    }
  });

  return merged;
}


export function mergeFeedbackData(existingData, incomingData) {
  const map = new Map();

  // clone existing
  existingData.forEach(entry => {
    map.set(String(entry.courseId), {
      courseId: String(entry.courseId),
      feedbacks: [...(entry.feedbacks || [])]
    });
  });

  incomingData.forEach(incomingEntry => {
    const courseId = String(incomingEntry.courseId);
    const existingEntry = map.get(courseId);

    if (!existingEntry) {
      // new course feedback entirely
      map.set(courseId, {
        courseId,
        feedbacks: [...(incomingEntry.feedbacks || [])]
      });
      return;
    }

    // merge feedbacks per userId
    incomingEntry.feedbacks.forEach(incomingFb => {
      const idx = existingEntry.feedbacks.findIndex(
        f => f.userId === incomingFb.userId
      );

      if (idx === -1) {
        // new user feedback
        existingEntry.feedbacks.push(incomingFb);
      } else {
        // overwrite changed values
        existingEntry.feedbacks[idx] = {
          ...existingEntry.feedbacks[idx],
          ...incomingFb
        };
      }
    });
  });

  return Array.from(map.values());
}

export function mergeXP(localXP, serverXP) {
  const map = new Map();

  // Server = source of truth
  serverXP.forEach(xp => {
    map.set(xp.userId, { ...xp });
  });

  // Merge local (only if missing or higher)
  localXP.forEach(local => {
    const server = map.get(local.userId);
    if (!server) {
      map.set(local.userId, { ...local });
    } else if (local.points !== server.points) {
      // choose higher to avoid loss
      map.set(local.userId, {
        userId: local.userId,
        points: Math.max(local.points, server.points),
      });
    }
  });

  return [...map.values()];
}