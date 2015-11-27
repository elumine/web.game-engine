var mesh = new Engine.Geometry.CMesh("Cube", 8, 12);
mesh.Vertices[0] = {Coordinates: new Math.Vector3(-1, 1, 1),   Normal: new Math.Vector3(-1, 1, 1),   TextureCoordinates: new Math.Vector2(0,0)};
mesh.Vertices[1] = {Coordinates: new Math.Vector3(1, 1, 1),    Normal: new Math.Vector3(1, 1, 1),    TextureCoordinates: new Math.Vector2(0,0)};
mesh.Vertices[2] = {Coordinates: new Math.Vector3(-1, -1, 1),  Normal: new Math.Vector3(-1, -1, 1),  TextureCoordinates: new Math.Vector2(0,0)};
mesh.Vertices[3] = {Coordinates: new Math.Vector3(1, -1, 1),   Normal: new Math.Vector3(1, -1, 1),   TextureCoordinates: new Math.Vector2(0,0)};
mesh.Vertices[4] = {Coordinates: new Math.Vector3(-1, 1, -1),  Normal: new Math.Vector3(-1, 1, -1),  TextureCoordinates: new Math.Vector2(0,0)};
mesh.Vertices[5] = {Coordinates: new Math.Vector3(1, 1, -1),   Normal: new Math.Vector3(1, 1, -1),   TextureCoordinates: new Math.Vector2(0,0)};
mesh.Vertices[6] = {Coordinates: new Math.Vector3(1, -1, -1),  Normal: new Math.Vector3(1, -1, -1),  TextureCoordinates: new Math.Vector2(0,0)};
mesh.Vertices[7] = {Coordinates: new Math.Vector3(-1, -1, -1), Normal: new Math.Vector3(-1, -1, -1), TextureCoordinates: new Math.Vector2(0,0)};
mesh.Faces[0] = {
    A: 0,
    B: 1,
    C: 2
};
mesh.Faces[1] = {
    A: 1,
    B: 2,
    C: 3
};
mesh.Faces[2] = {
    A: 1,
    B: 3,
    C: 6
};
mesh.Faces[3] = {
    A: 1,
    B: 5,
    C: 6
};
mesh.Faces[4] = {
    A: 0,
    B: 1,
    C: 4
};
mesh.Faces[5] = {
    A: 1,
    B: 4,
    C: 5
};
mesh.Faces[6] = {
    A: 2,
    B: 3,
    C: 7
};
mesh.Faces[7] = {
    A: 3,
    B: 6,
    C: 7
};
mesh.Faces[8] = {
    A: 0,
    B: 2,
    C: 7
};
mesh.Faces[9] = {
    A: 0,
    B: 4,
    C: 7
};
mesh.Faces[10] = {
    A: 4,
    B: 5,
    C: 6
};
mesh.Faces[11] = {
    A: 4,
    B: 6,
    C: 7
};

document.addEventListener("DOMContentLoaded", function()
{
    var engine = new Engine(
    {
        camera: new Engine.CCamera(
        {
            Position: new Math.Vector3(10, 10, 10),
            Target: new Math.Vector3(0, 0, 0),
            Up: Math.Vector3.Up(),
            aspect: 0.78,
            znear: 0.01,
            zfar: 1
        }),
        device: new Engine.CDevice(
        {
            canvasID: "frontBuffer",
            canvasWidth: 400,
            canvasHeight: 300
        })
    });
    mesh.Texture = new Texture('1.jpg', 512, 512);
    mesh.computeFacesNormals();
    engine.scene.buffer.mesh.push(mesh);

    //engine.configuration.drawingLoopCycle = false;

    engine.drawingLoopFn = function()
    {
        engine.scene.getMesh('Cube').Rotation.x += 0.01;
        engine.scene.getMesh('Cube').Rotation.y += 0.01;
    }

    engine.render();

}, false);