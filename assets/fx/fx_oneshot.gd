extends AnimatedSprite2D
# 한 번 재생되는 이펙트: 끝나면 스스로 사라진다.
func _ready() -> void:
	animation_finished.connect(queue_free)
