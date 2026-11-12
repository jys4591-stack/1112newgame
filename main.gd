extends Node2D
# pixelfx 이펙트 데모: 횃불(반복)은 계속 타고, 서리 폭발(1회)은 클릭할 때마다(또는 4초마다) 터진다.

const TORCH := preload("res://assets/fx/fire/torch/torch.tscn")
const NOVA := preload("res://assets/fx/ice/frost-nova/frost-nova.tscn")
const FLOOR_Y := 300.0

func _ready() -> void:
	var bg := ColorRect.new()
	bg.color = Color(0.08, 0.09, 0.13)
	bg.size = Vector2(640, 360)
	add_child(bg)
	var ground := ColorRect.new()
	ground.color = Color(0.2, 0.22, 0.28)
	ground.position = Vector2(0, FLOOR_Y)
	ground.size = Vector2(640, 60)
	add_child(ground)

	var torch := TORCH.instantiate()
	torch.position = Vector2(120, FLOOR_Y)
	torch.scale = Vector2(2, 2)
	add_child(torch)

	_spawn_nova(Vector2(400, FLOOR_Y))
	var timer := Timer.new()
	timer.wait_time = 4.0
	timer.autostart = true
	timer.timeout.connect(func(): _spawn_nova(Vector2(400, FLOOR_Y)))
	add_child(timer)

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		_spawn_nova(Vector2(get_global_mouse_position().x, FLOOR_Y))

func _spawn_nova(pos: Vector2) -> void:
	var nova := NOVA.instantiate()   # 끝나면 스스로 queue_free
	nova.position = pos
	add_child(nova)
