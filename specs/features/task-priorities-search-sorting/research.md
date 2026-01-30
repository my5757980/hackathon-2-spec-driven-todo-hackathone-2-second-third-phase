# Research: Task Priorities, Search, and Sorting

**Feature**: task-priorities-search-sorting
**Date**: 2026-01-17
**Status**: Complete

## Research Summary

No NEEDS CLARIFICATION items were identified in the Technical Context. All technology choices are predetermined by the constitution (Phase 1 requirements). Research focused on implementation patterns and best practices.

---

## Decision 1: Priority Data Type Representation

**Decision**: Use Python Enum for priority levels

**Rationale**:
- Type safety: Enum prevents invalid priority values at the model level
- Self-documenting: `Priority.HIGH` is clearer than magic string "high"
- Sortable: Enum members can be given integer values for natural ordering (HIGH=1, MEDIUM=2, LOW=3)
- Python 3.13+ has excellent Enum support

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| String literals ("high", "medium", "low") | No type safety; string comparison needed everywhere |
| Integer values (1, 2, 3) | Not self-documenting; requires constant reference |
| StrEnum | Overkill for 3 fixed values; Enum with IntEnum for sorting is cleaner |

**Implementation**:
```python
from enum import IntEnum

class Priority(IntEnum):
    HIGH = 1
    MEDIUM = 2
    LOW = 3
```

---

## Decision 2: Tag Storage Structure

**Decision**: Use `list[str]` for tags with case-normalized storage

**Rationale**:
- Simple and Pythonic for in-memory storage
- List preserves insertion order (useful for display)
- Case-normalization (lowercase) ensures consistent filtering
- No need for Set since duplicate prevention can be handled at add time

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| `set[str]` | Loses insertion order; harder to serialize in future phases |
| `frozenset[str]` | Immutable; complicates tag updates |
| Custom Tag class | Over-engineering for Phase 1; can refactor in Phase 2 if needed |

**Implementation**:
- Store tags as lowercase: `["work", "urgent"]`
- Normalize input: `tag.lower().strip()`
- Validate: alphanumeric + hyphens, 1-50 chars

---

## Decision 3: Search Algorithm

**Decision**: Simple substring matching using Python `in` operator

**Rationale**:
- Spec explicitly states "simple substring matching (not full-text search)"
- `in` operator is O(n*m) but acceptable for ≤1000 tasks
- Case-insensitive via `.lower()` on both search term and text
- Searches both title and description fields

**Alternatives Considered**:
| Alternative | Rejected Because |
|-------------|------------------|
| Regular expressions | Overkill; user expects simple keyword search |
| Fuzzy matching (fuzzywuzzy) | External dependency prohibited |
| Word boundary matching | More complex than spec requires |

**Implementation**:
```python
def matches_search(task: Task, keyword: str) -> bool:
    keyword_lower = keyword.lower()
    return (
        keyword_lower in task.title.lower() or
        (task.description and keyword_lower in task.description.lower())
    )
```

---

## Decision 4: Filter Combination Logic

**Decision**: AND logic between filter types, OR logic within same filter type

**Rationale**:
- Spec explicitly states: "MUST support multiple values for the same filter type (OR logic)" (FR-019)
- Spec explicitly states: "MUST support combining different filter types (AND logic between types)" (FR-020)
- This matches user intuition: "show me high OR medium priority tasks that are pending"

**Implementation Pattern**:
```python
def filter_tasks(tasks, status=None, priorities=None, tags=None):
    result = tasks
    if status:
        result = [t for t in result if matches_status(t, status)]  # OR within
    if priorities:
        result = [t for t in result if t.priority in priorities]   # OR within
    if tags:
        result = [t for t in result if any(tag in t.tags for tag in tags)]  # OR within
    return result  # AND between filter types (chained)
```

---

## Decision 5: Sorting Implementation

**Decision**: Use Python's built-in `sorted()` with key functions

**Rationale**:
- `sorted()` is stable, efficient (Timsort O(n log n))
- No external dependencies needed
- Key functions allow clean abstraction of sort criteria

**Sort Key Functions**:
```python
SORT_KEYS = {
    "priority": lambda t: t.priority.value,  # IntEnum value (1, 2, 3)
    "title": lambda t: t.title.lower(),      # Case-insensitive
    "created": lambda t: t.created_at,       # Datetime
}
```

**Default Behavior**:
- Default sort: by creation date, ascending (oldest first)
- Priority ascending: HIGH → MEDIUM → LOW (1 → 2 → 3)
- Descending via `reverse=True`

---

## Decision 6: Tag Validation Pattern

**Decision**: Regex-based validation with clear error messages

**Rationale**:
- Spec defines: "alphanumeric characters and hyphens only, 1-50 characters" (FR-009)
- Regex is efficient and well-understood
- Explicit validation allows clear error messages per spec edge cases

**Implementation**:
```python
import re
TAG_PATTERN = re.compile(r'^[a-zA-Z0-9][a-zA-Z0-9\-]{0,49}$')

def validate_tag(tag: str) -> None:
    if not tag:
        raise ValueError("Tag cannot be empty")
    if not TAG_PATTERN.match(tag):
        raise ValueError(f"Invalid tag '{tag}'. Use alphanumeric characters and hyphens, 1-50 characters.")
```

---

## Best Practices Applied

### Click CLI Patterns

1. **Multiple option values**: Use `multiple=True` for `--tag` and `--priority` filters
   ```python
   @click.option('--tag', multiple=True, help='Filter by tag (can be repeated)')
   @click.option('--priority', multiple=True, type=click.Choice(['high', 'medium', 'low']))
   ```

2. **Default values**: Priority defaults to "medium" via model default, not CLI default

3. **Error handling**: Use `click.echo(message, err=True)` for error output to stderr

### Python Best Practices

1. **Type hints**: All functions typed for clarity and IDE support
2. **Dataclass or attrs**: Task model as dataclass for clean attribute access
3. **Single Responsibility**: Validators, filters, and CLI commands in separate modules

---

## Open Questions (None)

All technical decisions resolved. Proceed to Phase 1: Design & Contracts.
