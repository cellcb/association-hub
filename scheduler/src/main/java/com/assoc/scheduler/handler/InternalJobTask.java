package com.assoc.scheduler.handler;

import java.util.Map;

/**
 * Extension point for registering internal service jobs.
 */
public interface InternalJobTask {

    String getKey();

    void execute(Map<String, Object> params) throws Exception;
}
