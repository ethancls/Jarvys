from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
import subprocess
import uuid
import os
import time
import json

app = FastAPI(
    title="Jarvys API",
    description="API pour l'exécution de code Python",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route simple pour l'exécution de code
@app.post("/execute")
async def execute_code(req: Dict[str, Any]):
    # Créer un ID unique pour cette exécution
    exec_id = str(uuid.uuid4())
    workdir = f"/tmp/{exec_id}"
    os.makedirs(workdir, exist_ok=True)
    
    # Structure de résultat attendue
    execution_result = {
        "id": exec_id,
        "timestamp": time.time(),
        "inputs": [],
        "outputs": [],
        "errors": [],
        "success": True
    }

    # Écrire tous les fichiers dans le répertoire de travail
    main_file_path = None
    for file in req.get("files", []):
        file_path = os.path.join(workdir, file.get("name"))
        with open(file_path, "w") as f:
            f.write(file.get("content", ""))
        
        # Identifier le fichier principal
        if file.get("isMain"):
            main_file_path = file_path
            # Enregistrer le code source principal dans le résultat
            execution_result["code"] = file.get("content", "")

    # Si aucun fichier principal n'est spécifié, utiliser le premier
    if not main_file_path and req.get("files"):
        main_file_path = os.path.join(workdir, req.get("files")[0].get("name"))

    # Vérifier qu'il y a au moins un fichier
    if not main_file_path:
        raise HTTPException(status_code=400, detail="Aucun fichier fourni pour l'exécution")

    # Installer les dépendances si nécessaire
    if req.get("requirements"):
        req_path = os.path.join(workdir, "requirements.txt")
        with open(req_path, "w") as f:
            f.write("\n".join(req.get("requirements")))
        # Installation auto des bibliothèques
        pip_process = subprocess.run(
            ["pip", "install", "-r", req_path],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
            text=True
        )
        if pip_process.returncode != 0:
            execution_result["errors"].append(f"Erreur d'installation des dépendances: {pip_process.stderr}")
            execution_result["success"] = False

    # Exécution avec l'entrée utilisateur
    if req.get("input") is not None:
        try:
            # Enregistrer l'input
            execution_result["inputs"].append(req.get("input"))
            
            # Créer un fichier temporaire pour l'entrée
            input_file_path = os.path.join(workdir, "input.txt")
            with open(input_file_path, "w") as f:
                f.write(req.get("input", ""))
            
            # Exécution avec redirection de l'entrée
            with open(input_file_path, "r") as input_file:
                result = subprocess.run(
                    ["python", main_file_path],
                    stdin=input_file,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=10,  # Limite à 10 secondes
                    text=True,
                    cwd=workdir
                )
            
            # Enregistrer le résultat
            execution_result["outputs"].append(result.stdout)
            if result.stderr:
                execution_result["errors"].append(result.stderr)
                execution_result["success"] = False
            
        except subprocess.TimeoutExpired:
            execution_result["outputs"].append("")
            execution_result["errors"].append("Exécution interrompue: délai expiré (10s)")
            execution_result["success"] = False
    else:
        # Exécution sans entrée
        try:
            result = subprocess.run(
                ["python", main_file_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                timeout=10,  # Limite à 10 secondes
                text=True,
                cwd=workdir
            )
            
            # Enregistrer le résultat
            execution_result["outputs"].append(result.stdout)
            if result.stderr:
                execution_result["errors"].append(result.stderr)
                execution_result["success"] = False
                
        except subprocess.TimeoutExpired:
            execution_result["outputs"].append("")
            execution_result["errors"].append("Exécution interrompue: délai expiré (10s)")
            execution_result["success"] = False

    # Exécuter les tests si fournis
    if req.get("test_cases"):
        all_tests_passed = True
        test_results = []

        # Exécuter les tests
        for idx, test_case in enumerate(req.get("test_cases", [])):
            try:
                # Enregistrer l'input du test
                test_input = test_case.get("input", "")
                execution_result["inputs"].append(test_input)
                
                # Créer un fichier temporaire pour l'entrée
                input_file_path = os.path.join(workdir, f"input_{idx}.txt")
                with open(input_file_path, "w") as f:
                    if test_input is not None:
                        f.write(test_input)
                
                # Exécution isolée avec timeout et redirection de l'entrée
                with open(input_file_path, "r") as input_file:
                    result = subprocess.run(
                        ["python", main_file_path],
                        stdin=input_file,
                        stdout=subprocess.PIPE,
                        stderr=subprocess.PIPE,
                        timeout=10,  # Limite à 10 secondes
                        text=True,
                        cwd=workdir
                    )
                
                # Enregistrer le résultat
                execution_result["outputs"].append(result.stdout)
                if result.stderr:
                    execution_result["errors"].append(result.stderr)
                
                # Vérifier si le code a réussi
                success = result.returncode == 0 and not result.stderr
                
                # Normaliser les sorties pour comparer
                normalized_output = result.stdout.strip()
                normalized_expected = test_case.get("expected_output", "").strip()
                output_matches = normalized_output == normalized_expected
                
                if not output_matches:
                    all_tests_passed = False
                
                test_results.append({
                    "description": test_case.get("description", f"Test #{idx+1}"),
                    "input": test_input,
                    "expected_output": test_case.get("expected_output", ""),
                    "actual_output": result.stdout,
                    "error": result.stderr,
                    "success": success and output_matches
                })
                
            except subprocess.TimeoutExpired:
                all_tests_passed = False
                execution_result["outputs"].append("")
                execution_result["errors"].append(f"Test #{idx+1}: Exécution interrompue: délai expiré (10s)")
                
                test_results.append({
                    "description": test_case.get("description", f"Test #{idx+1}"),
                    "input": test_case.get("input", ""),
                    "expected_output": test_case.get("expected_output", ""),
                    "actual_output": "",
                    "error": "Exécution interrompue: délai expiré (10s)",
                    "success": False
                })
        
        execution_result["all_tests_passed"] = all_tests_passed
        execution_result["test_results"] = test_results

    # Nettoyage
    subprocess.run(["rm", "-rf", workdir])
    
    # Retourner les résultats
    return execution_result

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)