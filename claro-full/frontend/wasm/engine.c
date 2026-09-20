// engine.c - Minimal C reasoning engine for CLARO

#include <emscripten.h>
#include <string.h>
#include <stdlib.h>

// Simple helper to check if a substring exists
int contains(const char* haystack, const char* needle) {
  return strstr(haystack, needle) != NULL;
}

// Convert to lowercase (very basic, ASCII only)
void to_lower(char* s) {
  for (int i = 0; s[i]; i++) {
    if (s[i] >= 'A' && s[i] <= 'Z') s[i] += 32;
  }
}

// EMSCRIPTEN_KEEP ensures the function is exported
EMSCRIPTEN_KEEPALIVE
const char* reason(const char* question_json, const char* knowledge_json) {
  // For now, just a minimal demo:
  // If question contains "normalization", return a fixed JSON result.
  // In a real version, you'd parse JSON, search knowledge, etc.

  static char result[4096];

  char q[1024];
  strncpy(q, question_json, sizeof(q) - 1);
  q[sizeof(q) - 1] = '\0';
  to_lower(q);

  if (contains(q, "normalization")) {
    strcpy(result,
      "{"
      "\"status\":\"success\","
      "\"confidence\":\"high\","
      "\"sourceType\":\"Definition\","
      "\"answer\":{"
        "\"summary\":\"Normalization organizes data to reduce redundancy and improve integrity.\","
        "\"keyPoints\":[\"Reduces duplicate data\",\"Improves data integrity\",\"Uses normal forms\"],"
        "\"steps\":[\"Identify repeating groups\",\"Create separate tables\",\"Define keys\"],"
        "\"example\":\"Store customer details once and reference by ID.\","
        "\"whyItMatters\":\"Easier maintenance and fewer update anomalies.\""
      "},"
      "\"meta\":{\"subject\":\"DBMS\",\"chapter\":\"Normalization\",\"topic\":\"Introduction\"}"
      "}"
    );
  } else {
    strcpy(result,
      "{"
      "\"status\":\"nomatch\","
      "\"confidence\":\"low\","
      "\"sourceType\":\"Estimate\","
      "\"answer\":null,"
      "\"meta\":null"
      "}"
    );
  }

  return result;
}